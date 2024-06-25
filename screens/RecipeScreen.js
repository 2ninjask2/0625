import {
    FlatList,
    View, Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,Image,
    ActivityIndicator } from "react-native";
import React,{useState,useEffect, useRef} from "react";
import Icon from 'react-native-vector-icons/Fontisto';
import  {useCoreContext} from '../components/mainContext';

// api 파라미터 구조 정리
// http://openapi.foodsafetykorea.go.kr/api/인증키/서비스명/요청파일타입/요청시작위치/요청종료위치

/*
[{
    id = 고유번호
    name = 요리이름
    cook = 요리방법
    mainImg = 메인 이미지
    tan,dan,ji,na = 영양소
    yul = 열량(칼로리)
    item = 요리재료
    v = 분류
    make1~20 = 만드는 법(text)
    makeImg1~20 = 만드는 법(img)
}]
*/

// 하나의 레시피를 렌더링
const RecipeItem =  React.memo(({ recipe }) => {
    const [imageUrl, setImageUrl] = useState(recipe.imageUrl);
    useEffect(() => {
        setImageUrl(recipe.imageUrl);
    }, [recipe.imageUrl]);
    return (
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            {imageUrl?
                <Image
                style={{ width: 75, height: 75, marginBottom: 20 }}
                source={{ uri: imageUrl  }}
                />:
                <View style={{width:75, height:75, marginBottom: 20}}>
                </View>}
            <Text style={[styles.recipeTitle, {flex : 1, textAlign: "center"}]}>{recipe.RCP_NM}</Text>
        </View>
    );
});

// 레시피 컴포넌트
const Recipe = () => {
    const {items} = useCoreContext();
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const cacheRef = useRef({});

    // 비동기 병렬 fetch를 위해 영역 분할 할당하는 함수
    const generateKeyBatches = (start, end, batchSize) => {
        const keyBatches = [];
        for (let i =start; i<=end; i += batchSize) {
            keyBatches.push({start:i, end:Math.min(i+batchSize -1, end)});
        }
        return keyBatches;
    }

    // 데이터 fetch
    const fetchDataForKeyBatch = async (start, end, retries = 3, delay = 1000) => {
        const url = `https://openapi.foodsafetykorea.go.kr/api/4d4e8e573d664c8f85d7/COOKRCP01/json/${start}/${end}`;
        try{
            const response = await fetch(url, {
                headers: {
                    Accept: "application/json",
                },
                method: "GET",
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            try{if(retries > 0) {
                console.log(`Retrying fetch... (${retries} attempts left)`);
                await new Promise(res => setTimeout(res, delay));
                return fetchDataForKeyBatch(start, end, retries-1, delay);
            } else {
                console.error("Failed to fetch data: ", error);
                throw error;
            }} catch(error){
                console.error("Failed to fetch data: ", error);
            }
        }
    }

    // 비동기 병렬 fetch 후 데이터 병합
    const fetchAndMergeData = async () => {
        const inventory = items? Object.values(items).map(item => item.category) : [];
        console.log(items);
        console.log(inventory);
        const keyBatches = generateKeyBatches(1,999,500);
        const fetchPromises = keyBatches.map(batch => fetchDataForKeyBatch(batch.start, batch.end));

        try {
            const results = await Promise.all(fetchPromises);
            const mergedData = results.flatMap(result => result.COOKRCP01.row.map(obj => {
                const reg = /[가-힣]+(?=\s*\(|\s*\d|,|$)/g;
                const ingredientsSet = new Set();
                const ingredientsList = obj.RCP_PARTS_DTLS
                .replace(/약간|인분|컵|송송 썬|불린 것|줄기부분|삶은것|주재료|주 재료|육수|마른것|양념|다진|부순|뿌리|으깬|데친|2가지색|재료|갈은것|다진것|개|적당량|소스|소스소개|작은술|큰술/g, "")
                .replace(/마리/g, "")
                .replace(new RegExp(obj.RCP_NM, 'g'), "")
                .match(reg);
                if(ingredientsList === null)
                    return null;
                ingredientsList.forEach(ingredient => ingredientsSet.add(ingredient));
                const ingredients = Array.from(ingredientsSet);

                const matchedIngredients = ingredients.filter(ingredient => inventory.includes(ingredient));
                const missingIngredients = ingredients.filter(ingredient => !inventory.includes(ingredient));
                const imageUrl = obj.ATT_FILE_NO_MK;

                if(matchedIngredients.length === 0)
                    return null;
                return {
                    ...obj,
                    matchedCount: matchedIngredients.length,
                    matchedIngredients: matchedIngredients || [],
                    missingIngredients: missingIngredients || [],
                    imageUrl: imageUrl
                };
            }).filter(data => data!==null));
                mergedData.sort((a, b) => b.matchedCount - a.matchedCount);
            setData(mergedData);
        } catch (error) {
            console.log("fetch data error", error);
        } finally {
            setLoading(false);
        }
    }

    // 캐시된 데이터를 사용하는 fetch 함수
    const fetchDataWithCache = async () => {
        const cacheKey = JSON.stringify(items);
        if (cacheRef.current[cacheKey]) {
            setData(cacheRef.current[cacheKey]);
            setLoading(false);
        } else {
            setLoading(true);
            await fetchAndMergeData();
            cacheRef.current[cacheKey] = data;
        }
    };

    // 레시피 선택하면 Modal 보이기
    const handlePressRecipe = (recipe) => {
        setSelectedRecipe(recipe);
        setModalVisible(true);
    }

    // 조리 과정과 이미지를 배열로 변환
    const getManualSteps = (recipe) => {
        let steps = [];
        for (let i = 1; i <= 20; i++) {
            let manualKey = `MANUAL${i.toString().padStart(2, '0')}`;
            let imageKey = `MANUAL_IMG${i.toString().padStart(2, '0')}`;

            if (recipe[manualKey]) {
                const modified = recipe[manualKey].split('\n').join(' ');
                steps.push({
                    step: modified,
                    imageUrl: recipe[imageKey]
                });
            }
        }
        return steps;
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
    }

    useEffect(() => {
        fetchDataWithCache();
    }, [items]);


    useEffect(() => {
        const filtered = data.filter(item => item.RCP_NM.includes(searchQuery));
        setFilteredData(filtered);
    },[searchQuery])

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput style={styles.searchInput} placeholder="검색"  value={searchQuery} onChangeText={handleSearch}/>
                <Icon name="search" size={24} color="black" style={styles.searchIcon} />
            </View>
            <Text style={styles.subHeader}>추천 레시피</Text>
            {loading ?
            <View style={{flex:1, justifyContent:"center", alignContent:"center"}}>
                <ActivityIndicator size="large" color="#00AEEF" />
            </View>
            :
            <View style={styles.recipeCard}>
                {data.length !== 0?
                    <FlatList
                        data={searchQuery === '' ? data : filteredData}
                        initialNumToRender={10} // 초기에 렌더링할 항목 수
                        maxToRenderPerBatch={10} // 한 번에 렌더링할 항목 수
                        keyExtractor={(item, index) => index.toString()}
                         getItemLayout={(data, index) => (
                           { length: 150, offset: 150 * index, index }
                        )}
                        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                        ListFooterComponent={<View style={{ height: 20 }} />}
                        renderItem={({item, index}) => (
                            <TouchableOpacity key={index} style={styles.recipeCard} onPress={() => handlePressRecipe(item)}>
                                <RecipeItem key={index} recipe={item} />
                                <Text style={styles.recipeHeadText}>보유 재료</Text>
                                <Text style={styles.recipeText}> {item.matchedIngredients.join(', ')}</Text>
                                <Text style={styles.recipeHeadText}>없는 재료</Text>
                                <Text style={styles.recipeText}> {item.missingIngredients.join(', ')}</Text>
                        </TouchableOpacity>
                        )}
                    /> :
                    <View style={{flex:1, justifyContent:"center", alignContent:"center"}}>
                        <Text style={{fontSize:24,fontWeight:"600", textAlign:"center"}}>해당 레시피 없음</Text>
                    </View>}
                </View>}
            {selectedRecipe && (
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                        setSelectedRecipe(null);
                    }}
                >
                    <ScrollView
                        style={styles.modalView}
                        contentContainerStyle={{ alignItems: 'center', paddingBottom: 50  }}
                    >
                        <Image style={styles.recipeImage} source={{ uri: selectedRecipe.ATT_FILE_NO_MK }} />
                        <Text style={styles.modalText}>{selectedRecipe.RCP_NM}</Text>
                        {getManualSteps(selectedRecipe).map((step, index) => (
                            <View key={index} style={{alignItems:"center"}}>
                                {step.imageUrl && (
                                    <Image
                                        style={styles.stepImage}
                                        source={{ uri: step.imageUrl }}
                                    />
                                )}
                                <Text style={styles.modalText}>{step.step}</Text>
                            </View>
                        ))}
                        <TouchableOpacity
                            style={[styles.buttonClose, {color: "red",}]}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.textStyle}>닫기</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 30,
        color: '#00AEEF',
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
        padding: 10,
        marginVertical: 20,
        marginHorizontal:32,
    },
    searchInput: {
        flex: 1,
        fontSize: 18,
    },
    searchIcon: {
        marginLeft: 10,
    },
    subHeader: {
        fontSize: 25,
        color: '#00AEEF',
        marginBottom: 20,
        marginTop: 12,
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalText: {
        fontSize: 24,
        textAlign: "justify",
        fontWeight: 'bold',
        marginBottom: 16,
    },
    recipeImage: {
        width: 300,
        height: 300,
        marginBottom: 20,
    },
    stepImage: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    buttonClose: {
        backgroundColor: "#00AEEF",
        borderRadius: 15,
        padding: 15,
        elevation: 2,
    },
    recipeCard: {
        borderWidth: 3,
        borderColor: '#7FDBB6',
        borderRadius: 10,
        padding: 20,
        marginBottom: 10,
        color: '#00AEEF',
        flex:1,
    },
    recipeTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    recipeText: {
        fontSize: 16,
        marginBottom: 5,
    },
    recipeHeadText: {
        fontSize: 18,
        marginBottom: 5,
        color: '#00AEEF',
    },
    textStyle: {
        fontSize:18,
        fontWeight:"600",
    }

});

export default Recipe;