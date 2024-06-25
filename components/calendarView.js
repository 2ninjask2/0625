// 소비기한 버튼을 눌렀을 때 표시되는 Modal 컴포넌트

import { View, Text,  StyleSheet, Modal, Button,Alert } from "react-native";

import { Calendar } from 'react-native-calendars';
import  {useCoreContext} from '../components/mainContext';

const CalendarView = ({expVisible, setExpVisible}) => {
    const {exp, setExp} = useCoreContext(); //소비기한 설정
    const markedDates = {}; //캘린더상에서 선택한 소비기한 날짜
    markedDates[exp] = { selected: true, selectedColor: 'blue' }; // 캘린더상에서 선택한 날짜 강조

    const dateSelected=(date) => { //선택한 소비기한 저장 함수
        const currentDate = new Date();

        if(currentDate.getTime() > date.timestamp)  // 소비기한이 현재 날짜 보다 이전이면 오류
            Alert.alert("소비기한 설정 오류", "적절한 소비기한이 아닙니다.",[ {text:'확인'}]);
        else
            setExp(date.dateString);
    }
    const onClickCloseCalendar = () => setExpVisible(false); // 캘린더 표시 해제
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={expVisible}
            onRequestClose={onClickCloseCalendar}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={{ fontSize: 20, marginBottom: 10 }}>소비기한 선택</Text>
                    <Calendar onDayPress={dateSelected} markedDates={markedDates} />
                    <Button title="선택" onPress={onClickCloseCalendar} />
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
        justifyContent:"space-between"
    },
})

export default CalendarView;