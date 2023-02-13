import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDispatch, useSelector } from "react-redux"
import {
  Input,
  Modal,
  Option,
  PenIcon,
  Select,
  TriggerProvider,
  globalColor,
  illaPrefix,
} from "@illa-design/react"
import { getIconFromResourceType } from "@/page/App/components/Actions/getIcon"
import { ResourceGenerator } from "@/page/Dashboard/components/ResourceGenerator"
import { ResourceCreator } from "@/page/Dashboard/components/ResourceGenerator/ResourceCreator"
import { getCachedAction } from "@/redux/config/configSelector"
import { configActions } from "@/redux/config/configSlice"
import { ActionTriggerMode } from "@/redux/currentApp/action/actionState"
import { getAllResources } from "@/redux/resource/resourceSelector"
import {
  getResourceNameFromResourceType,
  getResourceTypeFromActionType,
} from "@/utils/actionResourceTransformer"
import {
  itemContainer,
  itemLogo,
  itemText,
  resourceChooseContainerStyle,
  resourceEndStyle,
  resourceTitleStyle,
} from "./style"

export const ResourceChoose: FC = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const [editorVisible, setEditorVisible] = useState(false)
  const [generatorVisible, setGeneratorVisible] = useState(false)

  const resourceList = useSelector(getAllResources)
  const action = useSelector(getCachedAction)!!

  //maybe empty
  const currentSelectResource = resourceList.find(
    (r) => r.resourceId === action.resourceId,
  )

  return (
    <TriggerProvider renderInBody zIndex={10}>
      <div css={resourceChooseContainerStyle}>
        <span css={resourceTitleStyle}>{t("resources")}</span>
        <div css={resourceEndStyle}>
          <Input
            w="360px"
            colorScheme="techPurple"
            readOnly
            value={
              currentSelectResource ? (
                <div css={itemContainer}>
                  <span css={itemLogo}>
                    {getIconFromResourceType(
                      currentSelectResource.resourceType,
                      "14px",
                    )}
                  </span>
                  <span css={itemText}>
                    {currentSelectResource.resourceName}
                  </span>
                </div>
              ) : (
                t("editor.action.resource_choose.deleted")
              )
            }
            addAfter={
              <PenIcon
                color={globalColor(`--${illaPrefix}-grayBlue-04`)}
                onClick={() => {
                  setEditorVisible(true)
                }}
              />
            }
          ></Input>
          <Select
            ml="8px"
            w="360px"
            colorScheme="techPurple"
            value={action.triggerMode}
            onChange={(value) => {
              dispatch(
                configActions.updateCachedAction({
                  ...action,
                  triggerMode: value as ActionTriggerMode,
                }),
              )
            }}
          >
            <Option value="manually" key="manually">
              {t("editor.action.panel.option.trigger.manually")}
            </Option>
            <Option value="automate" key="automate">
              {t("editor.action.panel.option.trigger.on_change")}
            </Option>
          </Select>
        </div>
      </div>
      <Modal
        w="696px"
        visible={editorVisible}
        footer={false}
        closable
        withoutLine
        withoutPadding
        title={t("editor.action.form.title.configure", {
          name: getResourceNameFromResourceType(
            getResourceTypeFromActionType(action.actionType),
          ),
        })}
        onCancel={() => {
          setEditorVisible(false)
        }}
      >
        <ResourceCreator
          resourceId={action.resourceId}
          onBack={() => {
            setEditorVisible(false)
          }}
          onFinished={() => {
            setEditorVisible(false)
          }}
        />
      </Modal>
      <ResourceGenerator
        visible={generatorVisible}
        onClose={() => {
          setGeneratorVisible(false)
        }}
      />
    </TriggerProvider>
  )
}
