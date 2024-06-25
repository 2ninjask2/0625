import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Button, Alert, Linking, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { useCoreContext } from '../components/mainContext';

async function requestFileSystemPermissions() {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 30) { // Android 11 이상
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);

        const readMediaImagesGranted = granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES];
        const readMediaVideoGranted = granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO];

        if (readMediaImagesGranted === PermissionsAndroid.RESULTS.GRANTED && readMediaVideoGranted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          if (readMediaImagesGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN || readMediaVideoGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Alert.alert(
              '권한 필요',
              '앱에서 사진을 저장하고 불러오기 위해서는 저장소 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
              [
                { text: '나중에', style: 'cancel' },
                { text: '설정으로 이동', onPress: () => Linking.openSettings() }
              ]
            );
          } else {
            Alert.alert('권한 필요', '저장소 접근 권한이 필요합니다.');
          }
          return false;
        }
      } else { // Android 10 이하
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        const readGranted = granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE];
        const writeGranted = granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE];

        if (readGranted === PermissionsAndroid.RESULTS.GRANTED && writeGranted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          if (readGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN || writeGranted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Alert.alert(
              '권한 필요',
              '앱에서 사진을 저장하고 불러오기 위해서는 저장소 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
              [
                { text: '나중에', style: 'cancel' },
                { text: '설정으로 이동', onPress: () => Linking.openSettings() }
              ]
            );
          } else {
            Alert.alert('권한 필요', '저장소 접근 권한이 필요합니다.');
          }
          return false;
        }
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  } else {
    return true;
  }
}

function ImageReviewScreen({ route, navigation }) {
  const { photoUri } = route.params;
  const { items, setItems } = useCoreContext();

  useEffect(() => {
    (async () => {
      const hasPermission = await requestFileSystemPermissions();
      if (!hasPermission) {
        return;
      }
    })();
  }, []);

  const savePhoto = async () => {
    try {
      const hasPermission = await requestFileSystemPermissions();
      if (!hasPermission) {
        return;
      }

      const newFileName = `${Date.now()}.jpg`;
      const newPhotoPath = `${RNFS.DocumentDirectoryPath}/${newFileName}`;

      await RNFS.copyFile(photoUri, newPhotoPath);
      Alert.alert('알림', '사진이 저장되었습니다.');
      navigation.popToTop();
    } catch (error) {
      console.error('Failed to save photo:', error);
      Alert.alert('알림', '사진 저장에 실패했습니다.');
    }
  };

  const updateItemsList = (newItems) => {
    const updatedItems = { ...items };

    Object.keys(updatedItems).forEach(key => {
      if (!newItems.includes(key)) {
        delete updatedItems[key];
      }
    });

    newItems.forEach(item => {
      if (!updatedItems[item]) {
        updatedItems[item] = { itemName: item, exp: '', stock: 1, category: '' };
      }
    });

    setItems(updatedItems);
  };

  const uploadPhoto = async (apiEndpoint) => {
    try {
      const file = {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      };
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`Failed to upload photo: ${response.status} ${responseText}`);
      }

      const responseJson = await response.json();

      if (responseJson && responseJson.items) {
        updateItemsList(responseJson.items);
      }

      Alert.alert('알림', '사진이 업로드되었습니다.', `결과: ${JSON.stringify(responseJson)}`);
      navigation.navigate('MainScreen');
    } catch (error) {
      console.error('Error during photo upload:', error.message);
      Alert.alert('알림', '사진 업로드에 실패했습니다. 사진이 로컬에 저장됩니다.');
      savePhoto();
    }
  };

  const chooseFolderAndSave = () => {
    Alert.alert(
      "사진유형 선택",
      "무슨 사진을 찍으셨나요?",
      [
        {
          text: "영수증",
          onPress: () => uploadPhoto("https://fridge.damecon.org/docs#/default/ocr_ocr__post")
        },
        {
          text: "냉장고",
          onPress: () => uploadPhoto("https://fridge.damecon.org/food_detection")
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {photoUri && <Image source={{ uri: `file://${photoUri}` }} style={styles.image} onError={() => Alert.alert('이미지 로드 실패', '이미지를 로드하는데 실패했습니다.')} />}
      <Button title="저장하기" onPress={chooseFolderAndSave} />
      <Button title="취소" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '90%',
    height: '80%',
  },
});

export default ImageReviewScreen;
