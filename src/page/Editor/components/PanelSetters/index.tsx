import ListSetter from "./ListSetter"
import BaseInput from "./InputSetter/baseInput"
import BaseRadioGroupSetter from "./RadioGroupSetter/baseRadioGroup"
// import EventHandlerSetter from "./EventHandlerSetter"
import BaseSwitchSetter from "./SwitchSetter/baseSwitch"
import DynamicSwitchSetter from "./SwitchSetter/dynamicSwitch"

const SetterTypeMapSetter = {
  INPUT_SETTER: BaseInput,
  RADIO_GROUP_SETTER: BaseRadioGroupSetter,
  SWITCH_SETTER: BaseSwitchSetter,
  LIST_SETTER: ListSetter,
  DYNAMIC_SWITCH_SETTER: DynamicSwitchSetter,
  // EVENT_HANDLER_SETTER: EventHandlerSetter,
}

export type SetterType = keyof typeof SetterTypeMapSetter

export const getSetterByType = (type: SetterType) => {
  return SetterTypeMapSetter[type]
}
