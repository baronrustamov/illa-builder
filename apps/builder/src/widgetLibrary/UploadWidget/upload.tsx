import { FC, useCallback, useEffect, useRef, useState } from "react"
import useMeasure from "react-use-measure"
import { RequestOptions, Upload, UploadItem } from "@illa-design/react"
import { InvalidMessage } from "@/widgetLibrary/PublicSector/InvalidMessage"
import { handleValidateCheck } from "@/widgetLibrary/PublicSector/InvalidMessage/utils"
import { TooltipWrapper } from "@/widgetLibrary/PublicSector/TooltipWrapper"
import { applyValidateMessageWrapperStyle } from "@/widgetLibrary/PublicSector/TransformWidgetWrapper/style"
import {
  uploadContainerStyle,
  uploadLayoutStyle,
} from "@/widgetLibrary/UploadWidget/style"
import { UploadWidgetProps, WrappedUploadProps } from "./interface"
import {
  dataURLtoFile,
  getFileString,
  getFilteredValue,
  toBase64,
} from "./util"

const getCurrentList = (fileList: UploadItem[]) =>
  fileList.map((file) => {
    if (!file) {
      return
    }
    const { originFile, ...others } = file
    return others
  }) || []

const getFiles = (fileList: UploadItem[]) =>
  fileList.map((file) => ({
    lastModified: file.originFile?.lastModified,
    name: file.originFile?.name,
    size: file.originFile?.size,
    type: file.originFile?.type,
  })) || []

export const WrappedUpload: FC<WrappedUploadProps> = (props) => {
  const {
    selectionType,
    type,
    displayName,
    showFileList,
    disabled,
    fileType = [],
    loading,
    buttonText,
    dropText,
    colorScheme,
    variant,
    parseValue,
    fileList,
    onRemove,
    onChange,
    getValidateMessage,
    handleUpdateMultiExecutionResult,
    customRequest,
  } = props

  const isDrag = type === "dropzone"
  const inputAcceptType = fileType.join(",")

  useEffect(() => {
    if (!fileList) {
      return
    }
    new Promise((resolve) => {
      ;(async () => {
        const values = await Promise.allSettled(
          fileList.map(async (file) => await toBase64(file)),
        )
        let parsedValues
        if (parseValue) {
          parsedValues = await Promise.allSettled(
            fileList.map(async (file) => {
              const res = await getFileString(file)
              return res
            }),
          )
        }
        resolve({
          values,
          parsedValues,
          fileList,
        })
      })()
    }).then((value) => {
      const {
        values,
        parsedValues,
        fileList = [],
      } = value as {
        values: any[]
        parsedValues: any[]
        fileList: UploadItem[]
      }
      const validateMessage = getValidateMessage(fileList)
      const files = getFiles(fileList)
      const base64value = getFilteredValue(values, "base64")
      const parsed = getFilteredValue(parsedValues)
      const currentList = getCurrentList(fileList)
      handleUpdateMultiExecutionResult([
        {
          displayName,
          value: {
            files,
            value: base64value,
            parsedValue: parsed,
            validateMessage,
            currentList,
          },
        },
      ])
    })
  }, [
    displayName,
    parseValue,
    fileList,
    getValidateMessage,
    handleUpdateMultiExecutionResult,
  ])

  return (
    <Upload
      customRequest={customRequest}
      disabled={disabled}
      text={isDrag ? dropText : buttonText}
      colorScheme={colorScheme}
      variant={variant}
      loading={loading}
      multiple={!!(selectionType === "multiple")}
      directory={selectionType === "directory"}
      drag={isDrag}
      {...(!!inputAcceptType && { accept: inputAcceptType })}
      {...(fileList && {
        fileList,
      })}
      onRemove={onRemove}
      onChange={onChange}
      showUploadList={showFileList}
    />
  )
}
WrappedUpload.displayName = "WrappedUpload"

export const UploadWidget: FC<UploadWidgetProps> = (props) => {
  const {
    type,
    buttonText,
    dropText,
    fileType,
    selectionType,
    appendFiles,
    showFileList,
    parseValue,
    displayName,
    customRule,
    tooltipText,
    required,
    minFiles,
    maxFiles,
    sizeType,
    maxSize,
    currentList,
    value,
    files,
    minSize,
    validateMessage,
    triggerEventHandler,
    hideValidationMessage,
    updateComponentHeight,
    handleUpdateDsl,
    handleUpdateGlobalData,
    handleDeleteGlobalData,
  } = props

  const fileListRef = useRef<UploadItem[]>([])
  const [currentFileList, setFileList] = useState<UploadItem[] | undefined>(
    undefined,
  )
  const fileCountRef = useRef<number>(0)
  const previousValueRef = useRef<UploadItem[]>([])

  const [containerRef, containerBounds] = useMeasure()
  useEffect(() => {
    updateComponentHeight(containerBounds.height)
  }, [updateComponentHeight, validateMessage, containerBounds.height])

  useEffect(() => {
    const canInitialDragValue =
      currentList &&
      currentList.length > 0 &&
      value &&
      files &&
      fileListRef.current?.length === 0 &&
      previousValueRef.current.length === 0

    if (canInitialDragValue) {
      const shownList = currentList.map((file, index) => {
        const base64 = value[index]
        const info = files[index]

        return {
          ...file,
          originFile: !base64
            ? new File([""], info.name, info)
            : dataURLtoFile(`data:${info.type};base64,${base64}`, info.name),
        }
      }) as UploadItem[]
      setFileList(shownList)
      fileListRef.current = shownList
    }
  }, [currentList, value, files])

  const getFileIndex = useCallback((files: UploadItem[], file: UploadItem) => {
    const currentFilesKeys = files.map((f) => f.uid || f.name)
    return currentFilesKeys.indexOf(file.uid || file.name)
  }, [])

  const handleOnRemove = (file: UploadItem, fileList: UploadItem[]) => {
    const currentFiles =
      previousValueRef.current.length > 0
        ? [...previousValueRef.current]
        : [...(fileListRef.current || [])]
    const index = getFileIndex(currentFiles, file)
    currentFiles.splice(index, 1)
    setFileList(currentFiles)
    fileListRef.current = currentFiles
    if (previousValueRef.current.length > 0) {
      previousValueRef.current = currentFiles
    }
    handleOnChange()
    return true
  }

  const customRequest = (options: RequestOptions) => {
    options.onSuccess()
  }

  const handleOnChange = useCallback(() => {
    triggerEventHandler("change")
  }, [triggerEventHandler])

  const onChanges = useCallback(
    (fileList: UploadItem[], file: UploadItem) => {
      let files = [...previousValueRef.current]
      if (file.status === "init") {
        files.push(file)
        previousValueRef.current = [...files]
        setFileList(files)
        fileCountRef.current += 1
        return
      }
      const index = getFileIndex(previousValueRef.current, file)
      if (index < 0) {
        return
      }
      files.splice(index, 1, file)
      setFileList(files)
      previousValueRef.current = files
      if (files.length === fileCountRef.current && !!fileCountRef.current) {
        const allSettled = files.every(
          (f) => f.status === "error" || f.status === "done",
        )
        if (allSettled) {
          const newList = appendFiles
            ? [...(fileListRef.current || []), ...files]
            : files
          setFileList(newList)
          fileListRef.current = newList
          previousValueRef.current = []
          fileCountRef.current = 0
          handleOnChange()
        }
      }
      return
    },
    [appendFiles, getFileIndex, handleOnChange],
  )

  const getValidateMessage = useCallback(
    (value?: UploadItem[]) => {
      if (!hideValidationMessage) {
        const message = handleValidateCheck({
          value,
          minFiles,
          maxFiles,
          minSize,
          maxSize,
          sizeType,
          required,
          customRule,
        })
        const showMessage = message && message.length > 0
        return showMessage ? message : ""
      }
      return ""
    },
    [
      customRule,
      hideValidationMessage,
      minFiles,
      maxFiles,
      minSize,
      sizeType,
      maxSize,
      required,
    ],
  )

  const handleValidate = useCallback(
    (value?: UploadItem[]) => {
      const message = getValidateMessage(value)
      handleUpdateDsl({
        validateMessage: message,
      })
      return message
    },
    [getValidateMessage, handleUpdateDsl],
  )

  useEffect(() => {
    handleUpdateGlobalData?.(displayName, {
      type,
      buttonText,
      dropText,
      fileType,
      selectionType,
      appendFiles,
      showFileList,
      parseValue,
      displayName,
      customRule,
      tooltipText,
      required,
      minFiles,
      maxFiles,
      maxSize,
      minSize,
      currentList,
      value,
      files,
      clearValue: () => {
        handleUpdateDsl({ value: [] })
        setFileList([])
      },
      validate: () => {
        return handleValidate(currentFileList)
      },
      setDisabled: (value: boolean) => {
        handleUpdateDsl({
          disabled: value,
        })
      },
      clearValidation: () => {
        handleUpdateDsl({
          validateMessage: "",
        })
      },
    })
    return () => {
      handleDeleteGlobalData(displayName)
    }
  }, [
    type,
    buttonText,
    dropText,
    fileType,
    selectionType,
    appendFiles,
    showFileList,
    parseValue,
    displayName,
    customRule,
    tooltipText,
    required,
    minFiles,
    maxFiles,
    maxSize,
    minSize,
    currentList,
    value,
    files,
    hideValidationMessage,
    currentFileList,
    handleUpdateDsl,
    handleUpdateGlobalData,
    handleDeleteGlobalData,
    handleValidate,
  ])

  return (
    <div css={uploadContainerStyle} ref={containerRef}>
      <TooltipWrapper tooltipText={tooltipText} tooltipDisabled={!tooltipText}>
        <div css={uploadLayoutStyle}>
          <WrappedUpload
            {...props}
            fileList={currentFileList}
            onChange={onChanges}
            onRemove={handleOnRemove}
            getValidateMessage={getValidateMessage}
            customRequest={customRequest}
          />
        </div>
      </TooltipWrapper>
      <div css={applyValidateMessageWrapperStyle(0, "left", true)}>
        <InvalidMessage validateMessage={validateMessage} />
      </div>
    </div>
  )
}
UploadWidget.displayName = "UploadWidget"
