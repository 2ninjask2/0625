import { View, Text,TouchableOpacity,StyleSheet } from "react-native";
import React from "react";

{/*왼쪽 버튼 문자열, onPress 콜백함수, 오른쪽 버튼 문자열, onPress 콜백함수*/}
const OpenCloseTwoButton = ({leftButtonString, onPressLeftButton, rightButtonString, onPressRightButton }) => {
    const styles = StyleSheet.create({
        buttonStyle:{
          backgroundColor:"#00AEEF", padding:15, borderRadius:15
        },
        textStyle:{
            fontSize:18, 
            fontWeight:"600"
        }
      });
    return (
        <View style={{flexDirection:"row", justifyContent:"space-between"}}>
            <TouchableOpacity style={styles.buttonStyle} onPress={onPressLeftButton}>
                <Text style={styles.textStyle}>{leftButtonString}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonStyle} onPress={onPressRightButton} >
                <Text style={styles.textStyle}>{rightButtonString}</Text>
            </TouchableOpacity>
        </View>
    );

};

export default OpenCloseTwoButton;