// 물품 객체를 표현하는 컴포넌트

import { View, Text,StyleSheet, TouchableOpacity, Modal, Button} from "react-native";
import React, {useState, useMemo} from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import SvgIcon from '../components/SvgIcon';

import MemoView from '../components/memoView';

const getColorForExpiration = (exp) => { // 소비기한 남은 날짜 별 색상 반환 함수수
    const currentDate = new Date();
    const differenceInDays = Math.floor((exp - currentDate) / (1000 * 60 * 60 * 24));
    if (differenceInDays >= 7) 
      return 'green'; // 7일 이상: 초록색
    else if (differenceInDays >= 4) 
      return 'yellow'; // 4일 이하: 노란색
    else 
      return 'red'; // 2일 이하: 빨간색
    
};

// items {[name_Date]:{ itemName, exp, stock, category, memo, isDeleted}}
const Item = ({item, deleteOption, isDeleted}) => {
    const [memo, setMemo] = useState(item.memo);
    const [memoVisible, setMemoVisible] = useState(false); // 메모 Modal 표시 유무
    const [check, setCheck] = useState(isDeleted); // 해당 물품 삭제 유무
    const checkFalse = () => { //삭제 확인 아이콘 변경
        setCheck(false);
        item.isDeleted = false;
    }
    const onClickCheck =()=>{
        item.isDeleted = !check;
        setCheck(!check);
    }
    const expColor = getColorForExpiration(new Date(item.exp)); // 소비기한 색

    // 삭제 모드일 때, 삭제에 대한 이모티콘 표시
    const deleteOptionComponent = useMemo(() => {
        return(
            deleteOption?
            (<View style={{flexDirection:"row", flex:1, alignItems:"flex-end",justifyContent:"flex-end", }}>
                <Text style={styles.TextStyle}>삭제 </Text>
                <TouchableOpacity onPress={onClickCheck} activeOpacity={0.5} style={{marginleft:10}} >
                    <Text>
                        {check ?
                                (<Icon 
                                name="checkbox-outline" 
                                size={25} 
                                color= "#000000" 
                            />
                            ) : (
                                <Icon 
                                name="checkbox-blank-outline"
                                size={25} 
                                color= "#000000" 
                            />
                        )}
                    </Text>
                </TouchableOpacity>
            </View>
            ):checkFalse()
        );
    }, [deleteOption, check])

    
    const onClickReadMemo = () => { // 클릭시 메모 표시 설정
        setMemoVisible(true);
    };

    const updateMemo = (newMemo) => {
        item.memo = newMemo;
        setMemo(newMemo);
    }
    
    return (
        // 나중에 카테고리가 생기면 그 때 수정
        <View style={[styles.itemStyle]}>
            <View style={[styles.tmpImageView]}>
                {item.category===''?null:<SvgIcon name={item.category} size={48} fill={"black"}/>}
            </View>
            <View style={{flex:1, paddingHorizontal:20}}>
                <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                    <Text style={styles.TextNameStyle}>{item.itemName}</Text>
                    
                </View>
                <View style={{flexDirection:"row", justifyContent:"space-between"}}>
                    <Text style={styles.TextStyle}>수량 : {item.stock}</Text>
                    {item.exp!==''&&<Text style={[styles.TextStyle, {color:expColor}]}>~ {item.exp}</Text>}
                </View>
                    {/*
                <View style={{flexDirection:"row",paddingVertical:10, }}>
                    <TouchableOpacity onPress={onClickReadMemo} 
                        style={{ backgroundColor:"#2ECC71", paddingHorizontal:10, opacity:0.7, borderRadius:5}}>
                        <Text style={[styles.TextStyle, {padding:5,}]}>추가 정보</Text>
                    </TouchableOpacity>
                </View>*/}
                <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center"}}>
                    <TouchableOpacity onPress={onClickReadMemo} 
                        style={{ backgroundColor:"#2ECC71", paddingHorizontal:10, opacity:0.7, borderRadius:5}}>
                        <Text style={[styles.TextStyle, {padding:5,}]}>메모 읽기</Text>
                    </TouchableOpacity>
                    {deleteOptionComponent}
                </View>
                
            </View>
            <MemoView memoContext={memo} memoVisible={memoVisible} setMemoVisible={setMemoVisible} onUpdateMemo={updateMemo}/>
        </View>
    );
}

const styles = StyleSheet.create({
    itemStyle:{
        flex:1,
        marginTop:15,
        borderColor:"#7FDBB6",
        borderWidth:2,
        justifyContent:"space-between", 
        flexDirection:"row",
        padding:15,
        borderRadius: 15,
        alignContent:"center",
        borderLeftWidth:0,
        borderRightWidth:0,
        height:130,
        backgroundColor:"#7FDBB6",
    },
    tmpImageView:{
        borderBlockColor:"black",
        borderWidth: 2,
        borderRadius: 10,
        borderColor: 'black', 
        padding: 10, 
        width:80, 
        height:80,
        alignItems:"center",
        justifyContent:"center",
    },
    TextStyle:{
        fontSize:20,
        fontWeight:"600",
    },
    TextNameStyle:{
        fontSize:25,
        fontWeight:"bold",
    },    
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // 투명한 오버레이 배경색
      },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width:300,
        height:500,
        elevation: 5, // Android의 그림자 효과
        justifyContent:"space-between",
        
    },
})


export default Item;
