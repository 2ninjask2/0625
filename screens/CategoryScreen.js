// 카테고리 설정 화면입니다.

import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import OpenCloseTwoButton from '../components/OpenCloseTwoButton';
import React, { useState } from 'react';


import SvgIcon from '../components/SvgIcon';
import  {useCoreContext} from '../components/mainContext';

const CategoryScreen = ({navigation}) => {
    const {icons} = useCoreContext(); 
    
    // 선택된 상위 아이콘과 하위 아이콘 상태
    const [selectedParentIcon, setSelectedParentIcon] = useState(null);
    const [selectedParentIconIndex, setSelectedParentIconIndex] = useState(null);
    const [selectedChildIconIndex, setSelectedChildIconIndex] = useState(null);
    const [selectedChildIcon, setSelectedChildIcon] = useState(null);

    // 상위 아이콘을 선택할 때 호출되는 함수
    const handleParentIconSelect = (icon, index) => {
        console.log(icon, index);
        setSelectedParentIcon(icon);
        setSelectedParentIconIndex(index);

        setSelectedChildIconIndex(null); // 선택된 하위 아이콘 초기화
        setSelectedChildIcon(null);
        
    };

    // 하위 아이콘 렌더링 함수
    const renderChildren = (children) => {
        const columnCount = 4;
        const iconContainerWidth = 100 / columnCount + '%'; // 각 아이콘 컨테이너의 너비
        return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' , alignContent:"center"}}>
            {children.map((child, index) => (
                <View key={index} style={{ width: iconContainerWidth}}>
                    <TouchableOpacity 
                        key={index} 
                        style={{ marginRight: 20,
                            backgroundColor: selectedChildIconIndex === index ? "#87CEEB" : "transparent",
                            borderRadius: 10,
                            paddingVertical: 10,}}
                        onPress={() =>  {
                            console.log("child", index, child);
                            setSelectedChildIconIndex(index);
                            setSelectedChildIcon(child);
                            }
                        }>
                        <View style={{alignItems:"center"}}>
                            <SvgIcon 
                                name={child}
                                size={40}
                                fill={"#000000"} />
                            <Text style={{ textAlign: 'center', fontSize:10, }}>{child}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            ))}
        </View>);
    };

    return (
        <View style={{justifyContent:"space-between", flex:1, padding:30}}>
            <View style={{flex:1}}>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={{flex:1, color:'#000000'}}>
                    {icons.map((icon, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={{ marginRight: 20}}
                            onPress={() => handleParentIconSelect(icon,index)
                        }>
                            <View style={{alignItems:'center'}}>
                                <SvgIcon 
                                    name={icon.name}
                                    size={64}
                                    fill={selectedParentIconIndex==index?"#87CEEB":"#000000"} />
                                <Text style={{ textAlign: 'center' }}>{icon.name}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <View style={{flex:3}}>
                    <View style={styles.separator}></View>
                    
                    <ScrollView style={{padding:10}}>
                        {selectedParentIcon && renderChildren(selectedParentIcon.children)}
                    </ScrollView>
                </View>

            </View>
            <OpenCloseTwoButton 
                leftButtonString={'취소'} 
                rightButtonString={'다음'} 
                onPressLeftButton={()=>navigation.navigate('Main', {screen: 'MainScreen'})} 
                onPressRightButton={()=>{
                    navigation.navigate('Main', {screen:'Item', 
                    params: {
                        FoodAPI:null,
                        foodFromCamera:null,
                        categoryName:selectedChildIcon}});
                    
                }}/>
        </View>
    );
}

const styles =  StyleSheet.create({
    parentIconStyle:{
        fontSize:64,
    },
    childIconStyle:{
        fontSize:32,
    },
    iconSelectedStyle:{
        color:'blue',
    },
    separator: {
        height: 1,
        backgroundColor: 'black',
        marginHorizontal: 5,
        opacity : 0.5,
    }
})
export default CategoryScreen;