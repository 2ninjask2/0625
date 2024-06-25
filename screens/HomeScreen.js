/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * 홈 화면입니다.
 */


import React, {useEffect} from "react";
import {
  ScrollView, Text, View, StyleSheet, TouchableOpacity, Dimensions,Image,AssetUtils 
} from 'react-native';
import  {useCoreContext} from '../components/mainContext';
import SvgIcon from '../components/SvgIcon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const { width, height } = Dimensions.get('window');



const HomeScreen = ({navigation}) => {
  const { items, setItems, ITEMS_KEY} = useCoreContext();

  const copyAssetFileToFiles = async (assetFilePath, destFileName) => {
    try {
      // assets 폴더 내의 파일을 base64로 읽기
      const base64Image = await RNFS.readFileAssets(assetFilePath, 'base64');
      // 저장할 파일의 경로 설정
      const destFilePath = `${RNFS.DocumentDirectoryPath}/icon/${destFileName}`;
  
      // base64 데이터를 파일로 저장
      await RNFS.writeFile(destFilePath, base64Image, 'base64');
  
      console.log(`Copied ${assetFilePath} to ${destFilePath}`);
    } catch (error) {
      console.error(`Failed to copy ${assetFilePath}: `, error);
    }
  };

  const copyProjectFilesToFiles = async () => {
    const filesFolder = `${RNFS.DocumentDirectoryPath}/icon`;

    // files 폴더가 없는 경우 생성
    await RNFS.mkdir(filesFolder);
    const assets = [
      'icon/가지.png',  // assets 폴더 내의 파일 경로
      'icon/감.png',
      'icon/감자.png',
      'icon/고추.png',
      'icon/굴.png',
      'icon/귤.png',
      'icon/달걀.png',
      'icon/당근.png',
      'icon/대추.png',
      'icon/대파.png',
      'icon/두유.png',
      'icon/딸기.png',
      'icon/라임.png',
      'icon/망고.png',
      'icon/멜론.png',
      'icon/멸치.png',
      'icon/무.png',
      'icon/문어.png',
      'icon/방울토마토.png',
      'icon/배.png',
      'icon/배추.png',
      'icon/버섯.png',
      'icon/복숭아.png',
      'icon/브로콜리.png',
      'icon/블루베리.png',
      'icon/상추.png',
      'icon/소시지.png',
      'icon/시금치.png',
      'icon/아보카도.png',
      'icon/애호박.png',
      'icon/양배추.png',
      'icon/양상추.png',
      'icon/양파.png',
      'icon/연근.png',
      'icon/연어.png',
      'icon/오렌지.png',
      'icon/오이.png',
      'icon/오징어.png',
      'icon/옥수수.png',
      'icon/올리브.png',
      'icon/우유.png',
      'icon/자두.png',
      'icon/자몽.png',
      'icon/전복.png',
      'icon/쪽파.png',
      'icon/참외.png',
      'icon/청경채.png',
      'icon/체리.png',
      'icon/치즈.png',
      'icon/콩나물.png',
      'icon/크림.png',
      'icon/키위.png',
      'icon/토마토.png',
      'icon/파인애플.png',
      'icon/피망.png',
      'icon/햄.png',
      'icon/호박.png',
    ];
  
    for (const asset of assets) {
      const assetName = asset.split('/').pop();
      await copyAssetFileToFiles(asset, assetName);
    }
  };

  const loadItems = async () => {
    try{
      const asyncItems = await AsyncStorage.getItem(ITEMS_KEY);
      setItems(JSON.parse(asyncItems));
    } catch (e){
      console.log(e);
    }
  }
    useEffect(() => {
      loadItems();
      copyProjectFilesToFiles();
    }, []);
//바인딩 요소 'navigation'에 암시적으로 'any' 형식이 있습니다.
  return (
    <View style={{ flex: 10 }}>
      {/* 로고 그리기 */}
      <View style={styles.mainLogoStyle}>
        <View style={styles.circle}>
          <Text> 
            <SvgIcon name={'MainIcon'} size={200}/>
          </Text>
        </View>  
      </View>

      <View style={styles.buttonViewStyle}>
        {/*사진으로 이동*/}
        <TouchableOpacity 
          onPress= {() => {navigation.navigate('Main', { screen: 'CameraScreen' })}
        }
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>사진으로 시작</Text>
        </TouchableOpacity>  
        {/* 메인페이지 이동*/}
        <TouchableOpacity 
          onPress={() => {navigation.navigate('Main', {screen : 'MainScreen'})}}
          style={[styles.buttonStyle, {marginTop:20, }]}>
          <Text style={styles.buttonTextStyle}>바로 시작</Text>
        </TouchableOpacity>  
        {/* 갤러리페이지 이동*/}
        <TouchableOpacity 
          onPress={() => {navigation.navigate('Main', {screen : 'PhotoGalleryScreen'})}}
          style={[styles.buttonStyle, {marginTop:20, }]}>
          <Text style={styles.buttonTextStyle}>사진 갤러리</Text>
        </TouchableOpacity> 
      </View>
    </View>
  );
  
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent: "center",
  },
  mainLogoStyle:{
    flex:3,
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    backgroundColor: '#00AEEF',
    justifyContent: 'center',
    alignItems: 'center',

  },
  buttonViewStyle:{
    flex:2,
    alignItems:"center",
    justifyContent: "center",
    marginBottom: 20,
  },
  buttonStyle: {
    backgroundColor : "#7FDBB6",
    paddingHorizontal:width * 0.1,
    paddingVertical:height * 0.02,
    borderRadius:10,
    width:width*0.6,
    alignItems:"center"
  },
  buttonTextStyle:{
    fontSize:width * 0.045,
    fontWeight:"600",
  }
});

export default HomeScreen;
