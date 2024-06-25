// 물품 객체에 저장된 메모를 보여주는 Modal 컴포넌트

import { View, Text,  StyleSheet, Modal, Button, TextInput } from "react-native";
import {useEffect, useState} from "react";

const MemoView = ({memoContext, memoVisible, setMemoVisible, onUpdateMemo}) => {
    const [memo, setMemo] = useState(memoContext);

    useEffect(() => {
        setMemo(memoContext);
    },[memoContext]);
    
    const onChangeText=(text)=>{
        setMemo(text);
    }

    const onClickCloseMemo = () => {
        onUpdateMemo(memo);
        setMemoVisible(false);
    } 
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={memoVisible}
            onRequestClose={onClickCloseMemo}>
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent]}>
                    <Text style={{ fontSize: 20, marginBottom: 10, textAlign:"center",fontWeight:"bold" }}>메모</Text>
                    <View style={{borderRadius:10, borderWidth:2, borderColor:"black", flex:1, padding: 10, marginBottom:10}}>
                        <TextInput 
                        textAlignVertical="top"
                        onChangeText={onChangeText} 
                        value={memo}
                        multiline={true}
                        style={{ flex:1}}/>     
                    </View>
                    
                    <Button title="확인" onPress={onClickCloseMemo} />
                </View>
            </View>
         </Modal>);
}

const styles = StyleSheet.create({
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

export default MemoView;