import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

const OpenDeleteCloseButton = ({ leftButtonString, onPressLeftButton, middleButtonString, onPressMiddleButton, rightButtonString, onPressRightButton  }) => {
    return (
        <View style={{flexDirection:"row", justifyContent:"space-between"}}>   
            <TouchableOpacity style={styles.buttonStyle} onPress={onPressLeftButton}>
                <Text style={styles.textStyle}>{leftButtonString}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonStyle} onPress={onPressMiddleButton} >
                <Text style={styles.textStyle}>{middleButtonString}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonStyle} onPress={onPressRightButton}>
                <Text style={styles.textStyle}>{rightButtonString}</Text>
            </TouchableOpacity>       
        </View>
        
    );
};

const styles = StyleSheet.create({
    buttonStyle: {
        backgroundColor: "#00AEEF", 
        padding: 15,
        borderRadius: 15,
        alignSelf: 'center',
    },
    textStyle: {
        fontSize: 18,
        fontWeight: "600"
    }
});

export default OpenDeleteCloseButton;
