import { View, Text } from 'react-native'
import React from 'react'

const Checkboxprop = ({title}) => {

const [handleTick, sethandleTick] = useState(false)
  return (
    <View>
            <TouchableOpacity onPress={()=> setshowPass(!showPass)}>
          <Entypo name={`${showPass ? 'eye' : 'eye-with-line'}`} size={24} color={"#6c6c6c"} />
        </TouchableOpacity>
        
    </View>
  )
}

export default Checkboxprop