// 카메라 설정 화면입니다.

/*import { View, Text } from "react-native";
import React from "react";

const Camera = () => {
    return (
        <View style={{flex:1, alignItems:"center", justifyContent:"center"}}>
            <Text style={{fontSize:100}}>카메라</Text>
        </View>
    )
}

export default Camera;*/
import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Text, Button, Platform, Image, Alert } from 'react-native';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

function PhotoScreen({ navigation }) {
  const devices = useCameraDevices();
  const cameraRef = useRef(null);
  const [device, setDevice] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    const permissionToCheck = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    (async () => {
      let status = await check(permissionToCheck);
      if (status !== RESULTS.GRANTED) {
        status = await request(permissionToCheck);
      }
      setHasPermission(status === RESULTS.GRANTED);

      const backDevice = Object.values(devices).find(d => d?.position === 'back');
      setDevice(backDevice);
    })();
  }, [devices]);

  const takePhoto = async () => {
    if (cameraRef.current && hasPermission) {
      try {
        const photo = await cameraRef.current.takePhoto({ flash: 'off' });
        Image.getSize(`file://${photo.path}`, () => {
          navigation.navigate('ImageReviewScreen', { photoUri: photo.path });
        }, () => {
          Alert.alert('오류', '이미지에 문제가 생겼습니다. 다시 촬영해 주십시오.');
        });
      } catch (error) {
        Alert.alert('오류', '사진 촬영에 실패했습니다.');
      }
    }
  };

  if (!device || !hasPermission) {
    return <View style={styles.container}><Text>카메라 접근 권한을 요청 중입니다...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Camera ref={cameraRef} style={styles.camera} device={device} photo={true} isActive={hasPermission} />
      <Button title="사진촬영" onPress={takePhoto} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camera: { width: '100%', height: '90%' },
});

export default PhotoScreen;
