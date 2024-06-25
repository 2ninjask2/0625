import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, TextInput, Modal, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import RNPhotoManipulator from 'react-native-photo-manipulator';
import Item from '../components/Item';
import { useCoreContext } from '../components/mainContext';
import OpenCloseTwoButton from '../components/OpenCloseTwoButton';

const MainScreen = ({ navigation, route }) => {
  const { items, setItems, saveItems } = useCoreContext();
  const [sortedItems, setSortedItems] = useState([]);
  const [deleteOption, setDeleteOption] = useState(false);
  const [food, setFood] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [imageSelectVisible, setImageSelectVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedEgg1, setSelectedEgg1] = useState(null);
  const [selectedEgg2, setSelectedEgg2] = useState(null);
  const className = require('../assets/eng2kor.json');

  useEffect(() => {
    const sorted = items
      ? Object.entries(items).sort(([, itemA], [, itemB]) => new Date(itemA.exp) - new Date(itemB.exp))
      : [];
    setSortedItems(sorted);
    saveItems(items);
  }, [items]);

  const getImageUri = (localAsset) => {
    const uri = Image.resolveAssetSource(localAsset).uri;
    return uri.replace('/assets/assets', '/assets'); 
  };

  const uploadPhoto = async (imageSrc, url) => {
    try {
      if (!imageSrc) throw new Error("Invalid image source");

      console.log("Uploading photo:", imageSrc);
      
      const file = {
        uri: imageSrc,
        type: 'image/jpeg',
        name: imageSrc.split('/').pop(),
      };

      const formData = new FormData();
      formData.append('file', file);

      console.log("Form data:", formData);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseText = await response.text();
      console.log("서버 응답 텍스트:", responseText);

      if (!response.ok) {
        throw new Error(`Failed to upload photo: ${response.status} ${responseText}`);
      }

      const responseJson = JSON.parse(responseText);
      console.log("서버 응답 JSON:", responseJson);
      return responseJson;
    } catch (error) {
      console.error("uploadPhoto Error:", error);
      throw error;
    }
  };

  const processUploadImage = async (imageSrc1, imageSrc2) => {
    try {
      console.log("Processing images:", imageSrc1, imageSrc2);
      
      const responseImageSrc1 = await uploadPhoto(imageSrc1, 'https://fridge.damecon.org/food_detection');
      console.log("Response for egg1:", responseImageSrc1);

      const responseImageSrc2 = await uploadPhoto(imageSrc2, 'https://fridge.damecon.org/food_detection');
      console.log("Response for egg2:", responseImageSrc2);

      if (!responseImageSrc1 || !responseImageSrc2 || responseImageSrc1.length === 0 || responseImageSrc2.length === 0) {
        throw new Error("유효하지 않은 서버 응답");
      }

      const depth = responseImageSrc1[0]["bbox"][1] - responseImageSrc2[0]["bbox"][1];
      console.log("Depth calculation:", depth);

      const foodName = className[responseImageSrc1[0]["cls_name"]];
      console.log("Food name detected:", foodName);

      food['name'] = foodName;
      food['category'] = foodName;

      if (depth > 0) {
        console.log("Depth is positive, processing egg1");
        await cropAndSaveImage(imageSrc1, responseImageSrc1[0]['bbox'], foodName);
        await dataProcessing();
      } else if (depth < 0) {
        console.log("Depth is negative, processing egg2");
        console.log("Current items:", items);
        const newItems = { ...items };
        for (const key in newItems) {
          console.log("Item:", newItems[key]["itemName"]);
          if (newItems[key]["itemName"] === food['name']) {
            Alert.alert("삭제하기", `${food['name']}을(를) 삭제하시겠습니까?`, [
              { text: '취소' },
              {
                text: "삭제", onPress: () => {
                  delete newItems[key];
                  setItems(newItems);
                }
              }
            ]);
          }
        }
      }
      console.log("Food after processing:", food);
      console.log("Items after processing:", items);
      console.log("processUploadPhoto End");
    } catch (error) {
      console.error("processUploadImage Error: ", error);
    }
  };

  const cropAndSaveImage = async (imagePath, bbox, name) => {
    try {
      const width = bbox[2] - bbox[0];
      const height = bbox[3] - bbox[1];
      const cropRegion = { x: bbox[0], y: bbox[1], height: height, width: width };
      const targetSize = { height: 80, width: 80 };

      console.log(`Cropping image at path: ${imagePath}, region: ${JSON.stringify(cropRegion)}, target size: ${JSON.stringify(targetSize)}`);
      
      const croppedImagePath = await RNPhotoManipulator.crop(imagePath, cropRegion, targetSize);
      console.log(`Result image path: ${croppedImagePath}`);

      const outputPath = RNFS.DocumentDirectoryPath;
      const savedImagePath = await saveCroppedImage(croppedImagePath, outputPath, name);
      console.log(`Saved image path: ${savedImagePath}`);

      return savedImagePath;
    } catch (error) {
      console.error('cropAndSaveImage error:', error);
      throw error;
    }
  };

  const saveCroppedImage = async (croppedImagePath, outputPath, name) => {
    try {
      if (!croppedImagePath || typeof croppedImagePath !== 'string') {
        throw new Error("Invalid path");
      }

      const imageUrl = croppedImagePath;
      const destinationPath = `${outputPath}/${name}.jpg`;

      console.log(`Saving cropped image from ${imageUrl} to ${destinationPath}`);

      await RNFS.copyFile(imageUrl, destinationPath);

      console.log('Saved cropped image:', destinationPath);
      return destinationPath;
    } catch (error) {
      console.error('saveCroppedImage error:', error);
      throw error;
    }
  };

  const processFoodData = (name, data1, data2) => {
    try {
      var isSuccessful = false;
      if (data1 && data1.length > 0) {
        const foundFood = data1.find(item => item && item.food_name === name);
        if (foundFood) {
          const item = {
            name: foundFood.food_name,
            category: foundFood.food_representative
          };
          isSuccessful = true;
          return item;
        }
      }
      if (data2 && data2.length > 0) {
        const foundFood = data2.find(item => item && item.processed_food_name === name);
        if (foundFood) {
          const item = {
            name: foundFood.processed_food_name,
            category: foundFood.processed_food_representative
          };
          isSuccessful = true;
          return item;
        }
      }
      if (!isSuccessful) {
        return null;
      }
    } catch (error) {
      console.log("카메라에서 읽어온 객체 저장 실패", error);
    }
  };

  const fetchData = async () => {
    try {
      const foodResults = await Promise.all(Object.keys(food).map(async (name) => {
        const response1 = await fetch(`https://fridge.damecon.org/findfood/${name}`);
        const response2 = await fetch(`https://fridge.damecon.org/findprocessedfood/${name}`);
        const [foodResponse, processedFoodResponse] = await Promise.all([response1, response2]);
        const data1 = await foodResponse.json();
        const data2 = await processedFoodResponse.json();
        return { name: name, foodData: data1, processedFoodData: data2 };
      }));
      if (foodResults.length === 0)
        return null;
      else
        return foodResults;
    } catch (error) {
      console.error(error);
    }
  };

  const dataProcessing = async () => {
    const foodResults = await fetchData();
    if (foodResults) {
      const foodList = [];
      foodResults.forEach(foodResult => {
        if (foodResult.foodData.length !== 0 || foodResult.processedFoodData.length !== 0) {
          const foodData = processFoodData(foodResult.name, foodResult.foodData, foodResult.processedFoodData);
          if (foodData === null) {
            console.log("해당 이름에 맞는 객체 없음");
          } else {
            foodList.push(foodData);
          }
        }
      });
      console.log("Food list:", foodList);
      if (foodList.length === 0) {
        console.log("API data Zero");
        console.log("Food object:", food);
        navigation.navigate('Main', { screen: 'Item', params: { food: [food], categoryName: '' } });
      } else {
        navigation.navigate('Main', { screen: 'Item', params: { food: foodList, categoryName: '' } });
      }
    } else {
      console.log("Food object:", food);
      navigation.navigate('Main', { screen: 'Item', params: { food: [food], categoryName: '' } });
    }
  };

  const handleSaveItem = () => {
    setItems(prevItems => ({
      ...prevItems,
      [currentItem.name]: currentItem,
    }));
    saveItems({
      ...items,
      [currentItem.name]: currentItem,
    });
    setModalVisible(false);
  };

  const onClickPlus = () => {
    navigation.navigate('Main', { screen: 'Category' });
  };

  const onClickMinus = () => {
    setDeleteOption(!deleteOption);
  };

  const cancleDeleteItem = () => {
    setDeleteOption(false);
  };

  const deleteItem = () => {
    Alert.alert("삭제하기", "삭제하시겠습니까?", [
      { text: '취소' },
      {
        text: "삭제", onPress: () => {
          const newItems = { ...items };
          for (const key in newItems) {
            if (newItems[key].isDeleted)
              delete newItems[key];
          }
          setItems(newItems);
          setDeleteOption(false);
        }
      }
    ])
  };

  const handleEggButton = () => {
    setSelectedEgg1(null);
    setSelectedEgg2(null);
    setImageSelectVisible(true);
  };

  const handleImageSelect = (imageUri) => {
    if (!selectedEgg1) {
      setSelectedEgg1(imageUri);
    } else if (!selectedEgg2) {
      setSelectedEgg2(imageUri);
    }
  };

  const handleImageSelectionConfirm = () => {
    if (selectedEgg1 && selectedEgg2) {
      setImageSelectVisible(false);
      processUploadImage(selectedEgg1, selectedEgg2);
    } else {
      Alert.alert("이미지 선택", "두 개의 이미지를 선택해주세요.");
    }
  };

  const handleReceiptButton = async () => {
    try {
      const imageSrc = getImageUri(require('../assets/img/receipt1.jpg'));
      if (!imageSrc) throw new Error("Invalid image source");
      console.log("Receipt button clicked, processing image:", imageSrc);

      const responseImageSrc = await uploadPhoto(imageSrc, 'https://fridge.damecon.org/ocr');
      if (!responseImageSrc || responseImageSrc.length === 0) throw new Error("Invalid response from uploadPhoto");

      console.log("Response for receipt1:", responseImageSrc);
    } catch (error) {
      console.error("Receipt Button Error: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headText}>냉장고 매니저</Text>
        <View style={{ flexDirection: "row", padding: 10 }}>
          <TouchableOpacity onPress={onClickPlus} activeOpacity={0.5} style={{ alignItems: "flex-start" }}>
            <Text>
              <Icon name="plus-circle-outline" size={45} color="#000000" />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClickMinus} activeOpacity={0.5} style={{ alignItems: "flex-end", marginLeft: 20 }}>
            <Text>
              <Icon name="minus-circle-outline" size={45} color="#000000" />
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text>상품 정보 입력</Text>
          <TextInput
            style={styles.input}
            placeholder="상품명"
            value={currentItem ? currentItem.name : ''}
            onChangeText={(text) => setCurrentItem({ ...currentItem, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="카테고리"
            value={currentItem ? currentItem.category : ''}
            onChangeText={(text) => setCurrentItem({ ...currentItem, category: text })}
          />
          <Button title="저장" onPress={handleSaveItem} />
        </View>
      </Modal>

      <Modal visible={imageSelectVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text>이미지 선택</Text>
          <ScrollView>
            <TouchableOpacity onPress={() => handleImageSelect(getImageUri(require('../assets/img/egg1.jpg')))}>
              <Image source={require('../assets/img/egg1.jpg')} style={styles.imageThumbnail} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleImageSelect(getImageUri(require('../assets/img/egg2.jpg')))}>
              <Image source={require('../assets/img/egg2.jpg')} style={styles.imageThumbnail} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleImageSelect(getImageUri(require('../assets/img/receipt1.jpg')))}>
              <Image source={require('../assets/img/receipt1.jpg')} style={styles.imageThumbnail} />
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <Button title="취소" onPress={() => setImageSelectVisible(false)} />
            <Button title="확인" onPress={handleImageSelectionConfirm} />
          </View>
        </View>
      </Modal>

      {sortedItems.length === 0 ? null : (
        <ScrollView>
          {sortedItems.map(([key, item]) => (
            <View key={key}>
              <Item item={item} deleteOption={deleteOption} isDeleted={item.isDeleted} />
            </View>
          ))}
        </ScrollView>
      )}

      {deleteOption ? (
        <OpenCloseTwoButton
          leftButtonString={'취소'}
          rightButtonString={'삭제'}
          onPressLeftButton={cancleDeleteItem}
          onPressRightButton={deleteItem}
        />
      ) : null}

      <View style={styles.buttonContainer}>
        <Button title="Process Egg1,2" onPress={handleEggButton} />
        <Button title="Process Receipt1" onPress={handleReceiptButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F0", 
  },
  header: {
    backgroundColor: "#FFFFFF", 
    justifyContent: "center",
    alignItems: "center",
    flexDirection: 'row', 
    padding: 10,
  },
  headText: {
    color: "#00AEEF", 
    fontSize: 35,
    fontWeight: "bold"
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '80%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  imageThumbnail: {
    width: 100,
    height: 100,
    margin: 10,
  },
});

export default MainScreen;
