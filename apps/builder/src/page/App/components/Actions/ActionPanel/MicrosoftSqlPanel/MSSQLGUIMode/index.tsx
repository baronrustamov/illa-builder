import { FC, useEffect, useState } from "react"
import { Select } from "@illa-design/react"
import { Api } from "@/api/base"
import { MSSQLModeProps } from "@/page/App/components/Actions/ActionPanel/MicrosoftSqlPanel/interface"
import { InputEditor } from "@/page/App/components/InputEditor"
import {
  actionItemStyle,
  codeEditorLabelStyle,
} from "@/page/App/components/InputEditor/style"
import { MicrosoftSqlActionGUIMode } from "@/redux/currentApp/action/microsoftSqlAction"
import { ResourcesData } from "@/redux/resource/resourceState"

export const MSSQLGUIMode: FC<MSSQLModeProps> = (props) => {
  const { modeContent, onChange, resourceId } = props
  const newModeContent = modeContent as MicrosoftSqlActionGUIMode

  const [collectionSelect, setCollectionSelect] = useState<string[]>([])

  useEffect(() => {
    if (!resourceId) {
      return
    }
    Api.request(
      {
        url: `resources/${resourceId}/meta`,
        method: "GET",
      },
      ({ data }: { data: ResourcesData }) => {
        const tables = data.schema
          ? ((data.schema?.collections || []) as string[])
          : []
        setCollectionSelect(tables)
      },
      () => {},
      () => {},
      () => {},
    )
  }, [resourceId])

  return (
    <>
      <div css={actionItemStyle}>
        <span css={codeEditorLabelStyle}>Table</span>
        <Select
          colorScheme="techPurple"
          showSearch={true}
          defaultValue={newModeContent.table}
          value={newModeContent.table}
          ml="16px"
          w="100%"
          placeholder={"Select a table"}
          onChange={(value) => onChange("table", (value || "") as string)}
          options={collectionSelect}
        />
      </div>
      <InputEditor
        style={{ height: "88px" }}
        title={"Array of records to insert"}
        placeholder={"{{ [{x1:1, y1:1}, {x2:1, y2:1},...] }}"}
        lineNumbers={true}
        value={newModeContent.records}
        onChange={(value) => onChange(value, "records")}
      />
    </>
  )
}
MSSQLGUIMode.displayName = "MSSQLGUIMode"
