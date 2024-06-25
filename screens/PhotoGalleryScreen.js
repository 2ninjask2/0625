import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Text, FlatList, TouchableOpacity, Alert, Dimensions, Modal, Linking, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';

const windowWidth = Dimensions.get('window').width;

function PhotoGalleryScreen({ navigation }) {
  const [photos, setPhotos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 300, height: 300 });

  useEffect(() => {
    console.log("useEffect 호출됨");
    const requestReadStoragePermission = async () => {
      console.log("권한 요청 함수 호출됨");
      try {
        let granted;
        if (Platform.Version >= 30) {
          granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          ]);
        } else {
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: "저장소 접근 권한",
              message: "앱이 사진을 불러오기 위해 저장소 접근 권한이 필요합니다.",
              buttonNeutral: "나중에 묻기",
              buttonNegative: "거부",
              buttonPositive: "허용"
            }
          );
        }
        console.log("권한 요청 결과:", granted);
        if (
          (Platform.Version >= 30 && 
          granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] === PermissionsAndroid.RESULTS.GRANTED) || 
          granted === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log("저장소 읽기 권한을 받았습니다.");
          fetchPhotos();
        } else {
          console.log("저장소 읽기 권한을 받지 못했습니다.");
          if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            Alert.alert(
              "권한 필요",
              "앱에서 사진을 불러오기 위해서는 저장소 접근 권한이 필요합니다. 설정에서 권한을 허용해주세요.",
              [
                { text: "나중에", style: "cancel" },
                { text: "설정으로 이동", onPress: () => Linking.openSettings() }
              ]
            );
          }
        }
      } catch (err) {
        console.warn("권한 요청 중 오류 발생:", err);
      }
    };
    requestReadStoragePermission();
  }, []);

  const fetchPhotos = async () => {
    console.log("사진 불러오기 함수 호출됨");
    const baseDir = RNFS.DocumentDirectoryPath;
    console.log("기본 디렉토리 경로:", baseDir);
    let photos = [];

    try {
      const files = await RNFS.readDir(baseDir);
      console.log("폴더 내 파일들:", files);
      const folderPhotos = files.filter(file => file.isFile()).map(file => ({
        uri: `file://${file.path}`,
        id: file.name,
        date: new Date(file.mtime).toISOString().split('T')[0],
      }));
      photos = [...photos, ...folderPhotos];
    } catch (error) {
      console.error(`디렉토리 ${baseDir} 읽기 실패:`, error);
    }

    photos.sort((a, b) => new Date(b.date) - new Date(a.date));
    setPhotos(photos);
    console.log("정렬된 사진들:", photos);
  };

  const handleImagePress = image => {
    Image.getSize(image.uri, (width, height) => {
      const scaleWidth = windowWidth * 0.8;
      const scaleHeight = (height / width) * scaleWidth;
      setImageSize({ width: scaleWidth, height: scaleHeight });
      setSelectedImage(image);
      setModalVisible(true);
    }, error => {
      console.error('이미지 크기를 확인할 수 없습니다.', error);
      Alert.alert('오류', '이미지 크기를 확인할 수 없습니다.');
    });
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "사진 삭제",
      "정말로 이 사진을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { text: "확인", onPress: () => deletePhoto(selectedImage) }
      ]
    );
  };

  const deletePhoto = async (image) => {
    try {
      await RNFS.unlink(image.uri.replace('file://', ''));
      fetchPhotos();
      setModalVisible(false);
      Alert.alert("사진 삭제됨", "사진이 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error('사진 삭제 실패:', error);
      Alert.alert("삭제 실패", "사진 삭제에 실패했습니다.");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleImagePress(item)}>
      <Image source={{ uri: item.uri }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>사진 갤러리</Text>
      <FlatList
        data={photos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={styles.row}
        ListFooterComponent={<View style={{ height: 60 }} />} // 빈 공간 없애기 위해 추가
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Image source={{ uri: selectedImage?.uri }} style={{ width: imageSize.width, height: imageSize.height }} />
            <TouchableOpacity style={styles.button} onPress={handleClose}>
              <Text style={styles.buttonText}>닫기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleDelete}>
              <Text style={styles.buttonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  header: {
    fontWeight: 'bold',
    backgroundColor: '#eee',
    padding: 5,
    fontSize: 24,
    color: 'black',
    textAlign: 'center'
  },
  image: {
    width: windowWidth / 3 - 10,
    height: windowWidth / 3 - 10,
    margin: 5,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: "#2196F3",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
});

export default PhotoGalleryScreen;
