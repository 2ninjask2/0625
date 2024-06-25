// 물품 객체 정보에 대한 살세 설정 화면

import CalendarView from '../components/calendarView';
import MemoView from '../components/memoView';

import { View, Text, TouchableOpacity, StyleSheet,Alert, TextInput, ScrollView } from "react-native";
import React, {useState,useEffect} from "react";

import SvgIcon from '../components/SvgIcon';

import  {useCoreContext} from '../components/mainContext';
import OpenCloseTwoButton from '../components/OpenCloseTwoButton';
import {PropComponant, StockPropComponant} from '../components/PropComponant';
import OpenDeleteCloseButton from '../components/OpenDeleteCloseButton';


const ItemDetailSettingScreen =({navigation, route}) => {

  const { items, setItems,
          itemName, setItemName, 
          stock, setStock, 
          category, setCategory , 
          exp, setExp, saveItems,
         } = useCoreContext();
  const [expVisible, setExpVisible] = useState(false); // 소비기한 캘린더 Modal 표시 유무
  const [memoVisible, setMemoVisible] = useState(false); // 메모 Modal 표시 유무

  const [today] = useState(new Date());
  const [dateString] = useState(today.toISOString().split('T')[0]);
  const [memo, setMemo] = useState("");
  const [tempItems, setTempItems] = useState({}); // 카메라에서 읽어온 음식 배열을 임시로 저장하는 객체
  const [tempItemsReady, setTempItemsReady] = useState(false); // 추가할 물품 저장 완료 확인
  const [itemsUpdated, setItemsUpdated]= useState(false); // 전체 물품 데이터 결합 완료 확인
  const [prevMoveCheck, setPrevMoveCheck] = useState(false); // 이전으로 이동가능한 상태인지 체크

  const {food, categoryName} = route.params; /* food 이름, 카테고리*/
  const [foodList, setFoodList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);  // 음식 객체 추적을 위한 인덱스
  const expirationData = require('../assets/expirationDate.json');
  const updateMemo = (newMemo) => setMemo(newMemo);
  
  const mergeItems = () => {
    setItemsUpdated(true);
    const updatedItems = {...items, ...tempItems};
    setItems(updatedItems);
    
  }

  useEffect(()=>{
    if(tempItemsReady){
      mergeItems();
    }
  }, [tempItems]);


  useEffect(()=>{
    if(itemsUpdated){
      navigation.navigate('Main', { screen: 'MainScreen' });
      setPrevMoveCheck(false);
      setItemName("");
      setStock(1);
      setExp("");
      setCategory("");
      setMemo("");
      saveItems(items);
    }
  },[items]);

  useEffect(()=>{
    if(food && food.length > 0) {
      console.log(food);
      setFoodList(food);
      setCurrentIndex(0);
      setPrevMoveCheck(true);
    } else {
      setCategory(categoryName);
      setItemName(categoryName);
    }
  },[food])

  useEffect(() => {
    if(foodList.length > 0)
      processFoodData(currentIndex);
  }, [foodList, currentIndex]);

  useEffect(() => {
  // api로 읽어온 데이터는 name, 직접 입력인 경우는 category로 소비기한을 파악하기 때문에...
    if(!prevMoveCheck){
        const matchedFoodCategory = expirationData.expirationData.find((item) => item.name === category);
              if(matchedFoodCategory) {
                  const expiryDate = new Date(today);
                  expiryDate.setDate(today.getDate() + parseInt(matchedFoodCategory.expiry)); // 10진법
                  setExp(expiryDate.toISOString().split('T')[0]);
              } else {
                 setExp('');
              }
    }
  },[category])


  const processFoodData = (index) => {
    if(foodList.length > 0){
      setItemName(foodList[index].name);
      setCategory(foodList[index].category);
      setMemo("");
      // expirationDate 데이터 물품 이름과 비교
      const matchedFood = expirationData.expirationData.find((item) => item.name === foodList[index].name);
        if(matchedFood) {
            const expiryDate = new Date(today);
            expiryDate.setDate(today.getDate() + parseInt(matchedFood.expiry)); // 10진법
            setExp(expiryDate.toISOString().split('T')[0]);
        } else {
            setExp('');
        }
    } else {
      console.log("냉장고 물품 인식 실패");
    }
  }

  const onClickOpenCalendar= () => setExpVisible(true); // 캘린더 표시
  const onClickOpenMemo = () => setMemoVisible(true);

  //저장 버튼을 눌렀을 때 실행되는 함수
  const onPressItemStore = () => {
    const currentTime = Date.now().toString(); 
    const key = `${itemName}_${currentTime}`;
    if(itemName==='' || stock===0) {
      Alert.alert("입력 오류", "입력되지 않는 요소가 있습니다.",[ {text:'확인'}]);
    }
    else {
      const newItem = {
        key: key,
        item: {
          itemName: itemName,
          exp: exp,
          stock: stock,
          category: category,
          memo: memo,
          isDeleted: false
        }
      };
      if(prevMoveCheck){
        // 카메라에서 읽어온 음식 배열을 임시로 저장하는 객체
        const temp = {...tempItems};
        for (const key in temp){
          if(temp[key].itemName===newItem.item.itemName) { // 이전에 저장되어 있던 경우 삭제
            delete temp[key];
          }
        }
        const temp2 = {...items};
        for (const key in temp2){
          if(temp2[key].itemName===newItem.item.itemName && temp2[key].exp === newItem.item.exp) { 
            newItem.item.stock += temp2[key].stock;
            delete temp2[key];
          }
        }
        setItems(temp2);
        setTempItems({
          ...temp, [newItem.key]: newItem.item
        });
        if (currentIndex + 1 >=foodList.length) {
          setTempItemsReady(true);
        } else {
          setCurrentIndex(currentIndex + 1);
          setExp("");
        }
      }else {
        const temp2 = {...items};
        for (const key in temp2){
          if(temp2[key].itemName===newItem.item.itemName && temp2[key].exp === newItem.item.exp) { 
            newItem.item.stock += temp2[key].stock;
            delete temp2[key];
          }
        }
        setItems(temp2);
        setTempItems({[newItem.key]:newItem.item});
        setTempItemsReady(true);
      }
     
    }
  };

  const onPressPrev = () => 
  {
    if(!prevMoveCheck){
      navigation.navigate('Main', {screen : 'Category'});
      setExp("");
    }
    else{
      if(currentIndex <= 0){
        Alert.alert("오류", "이전으로 이동할 수 없습니다.",[ {text:'확인'}]);
        setExp("");
      }
      else{
        setCurrentIndex(currentIndex - 1);
      }
    }
  };
  const onPressDircard = () => {
    // 현재 인덱스의 물품 정보 제거
    if(foodList.length > 0 && currentIndex < foodList.length) {
      const tempList = foodList;
      const temp = {...tempItems};
      for (const key in temp){
        if(temp[key].itemName===tempList[currentIndex].name) { // 이전에 저장되어 있던 경우 삭제
          delete temp[key];
        }
      }
      setTempItems(temp);
      tempList.splice(currentIndex, 1);
      setFoodList(tempList);
      // 제거 후 다음 물품 정보로 넘어가거나, 물품 정보가 없다면 초기 화면으로 이동
      if(foodList.length > currentIndex) {
        processFoodData(currentIndex);
      } else {
        Alert.alert("알림", "마지막 물품입니다. 저장하시겠습니까?",[ {text:'확인', onPress: () => {
          mergeItems();
        }}]);
        // 더 이상 처리할 물품 정보가 없으면 저장 후 메인 화면으로 이동
        
      }
    }

  }
  const onChangeName=(value)=>{
      setItemName(value)
  }
  const onChangeStock=(stock)=>{
    const isNumber = !isNaN(parseFloat(stock)) && isFinite(stock);
    setStock(isNumber? stock:'');
  }



  return(
    <View style = {[styles.screenStyle,]}>
      <ScrollView style={[styles.itemCard, {flex:1}]}>
        <View style = {{flexDirection:"row", }}>
          <View style={[styles.categoryView, {margin:10, marginTop:25}]}>
            {category === ''? null: <SvgIcon name={category} size={48} fill={"black"}/>}
          </View>
          <View style={{flex:1, margin:10, marginTop:25}}>
            <TouchableOpacity                         
              onPress={() =>  {
                navigation.navigate('Main', { screen: 'Category'});
              }
              }>
              <View>
                <Text style={styles.TextStyle}>{category}</Text>
              </View>
            </TouchableOpacity>

            <PropComponant onChangeText={onChangeName} value={itemName}/>
          </View>
        </View>

        <View style={{height:20}}></View>

        <StockPropComponant propText={"수량 : "} onChangeText={onChangeStock} value={stock} keyboardType='numeric'/> 

        <View style={{height:10}}></View>

        <View style={{justifyContent:"space-between", flexDirection:"row"}}>
          <Text style={styles.TextStyle}>등록일</Text>
          <Text style={[styles.TextStyle]}>{dateString}</Text>
        </View>
        <View style={{height:20}}></View>
        <View style={{justifyContent:"space-between", flexDirection:"row"}}>
          <Text style={styles.TextStyle}>소비기한</Text>
          <Text style={[styles.TextStyle]}>{exp}</Text>
        </View>

        <View style={{alignItems:"center", paddingVertical:25}}>
          <TouchableOpacity onPress={onClickOpenCalendar} 
            style={styles.expButtonStyle}>
            <Text style={styles.TextStyle}>소비기한 선택</Text>
          </TouchableOpacity>
        </View>
        {/*
        <View>
          <Text>DB에서 읽어온 데이터가 표시될 위치</Text>
          </View>
        */}
        <View style={{ flex: 1, justifyContent: 'flex-start', paddingTop: 20 }}>
          <TouchableOpacity onPress={onClickOpenMemo} 
              style={{backgroundColor:"white", paddingHorizontal:10, height:200}}>
              {memo===''?<Text style={styles.TextStyle}>탭하여 메모 작성</Text>:
              <Text style={styles.TextStyle}>{memo}</Text>}
            </TouchableOpacity>
        </View>
      </ScrollView>
      {prevMoveCheck?
      <OpenDeleteCloseButton 
      leftButtonString={'이전'} 
      middleButtonString={'삭제'}
      rightButtonString={'저장'} 
      onPressLeftButton={onPressPrev}
      onPressMiddleButton={onPressDircard}
      onPressRightButton={onPressItemStore}/>
      :
      <OpenCloseTwoButton 
        leftButtonString={'이전'} 
        rightButtonString={'저장'} 
        onPressLeftButton={onPressPrev} 
        onPressRightButton={onPressItemStore}/>}
      <CalendarView expVisible={expVisible} setExpVisible={setExpVisible}/>
      <MemoView memoContext={memo} memoVisible={memoVisible} setMemoVisible={setMemoVisible} onUpdateMemo={updateMemo}/>
    </View>
    );
}



const styles = StyleSheet.create({
  screenStyle:{
    flex:1,
    padding:40,
    justifyContent:"space-between",
    backgroundColor:"#FFFFFF", 
  },
  itemCard:{
    borderRadius:10,
    borderWidth:2, 
    borderColor:"black", 
    paddingHorizontal:10, 
    paddingVertical : 5,
    marginBottom: 10,
    backgroundColor: "#87CEEB",
    
  },
  categoryView:{
    borderBlockColor:"black",
    borderWidth: 2,
    borderRadius: 10,
    borderColor: 'black', 
    alignItems:"center",
    justifyContent:"center",
    width:80, 
    height:80,
  },
  expButtonStyle:{
    backgroundColor:"#00AEEF", 
    alignItems:"center", 
    borderRadius:15, 
    padding:5, 
    width:150
  },
  memoButtonStyle:{
    backgroundColor:"#FFFFFF", 
    alignItems:"center", 
    borderRadius:15, 
    padding:5, 
    width:150
  },
  TextStyle:{
    fontSize:18,
    fontWeight:"600",
  },

  
});

export default ItemDetailSettingScreen;