import axios from "axios"
import { LoaderFunctionArgs, redirect } from "react-router-dom"
import { CloudApi } from "@/api/cloudApi"
import { clearRequestPendingPool } from "@/api/helpers/axiosPendingPool"
import { getTeamsInfo } from "@/api/team"
import { getCurrentUser } from "@/redux/currentUser/currentUserSelector"
import { currentUserActions } from "@/redux/currentUser/currentUserSlice"
import { UserInfoResponse } from "@/redux/currentUser/currentUserState"
import { cloudUrl } from "@/router/routerConfig"
import store from "@/store"
import { getAuthToken } from "@/utils/auth"
import { setLocalStorage } from "@/utils/storage"

const CLOUD = "/supervisor/api/v1"

export const getUserInfo = async (token?: string) => {
  try {
    const response = await axios.get<UserInfoResponse>("/users", {
      baseURL: `${location.protocol}//${
        import.meta.env.VITE_API_BASE_URL
      }${CLOUD}`,
      headers: token
        ? {
            Authorization: token,
          }
        : {},
    })
    store.dispatch(
      currentUserActions.updateCurrentUserReducer({
        ...response.data,
        userId: response.data.id,
      }),
    )
    return response.data
  } catch (e) {
    console.error("getUserInfo error", e)
  }
}

const removeUrlParams = (url: string, params: string[]) => {
  const urlObj = new URL(url)
  params.forEach((param) => {
    urlObj.searchParams.delete(param)
  })
  return urlObj
}

export const requireAuth = async (
  pathToken?: string | null,
  teamIdentifier?: string,
) => {
  const userInfo = getCurrentUser(store.getState())
  const token = getAuthToken() || pathToken
  if (pathToken) {
    setLocalStorage("token", pathToken, -1)
    // remove url params form location
    const url = removeUrlParams(window.location.href, ["token"])
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${url.search}`,
    )
  }
  if (!userInfo?.userId) {
    if (!token) {
      clearRequestPendingPool()
      return redirect(cloudUrl)
    } else {
      const userInfo = await getUserInfo(token)
      if (!userInfo) {
        return redirect(cloudUrl)
      }
    }
  }
  try {
    await getTeamsInfo(teamIdentifier, token)
  } catch (e) {
    if (e === "have no team match") {
      throw new Error(e)
    }
    console.error(e)
  }
  return null
}

export const handleRemoveUrlToken = async (args: LoaderFunctionArgs) => {
  const { request } = args
  const url = new URL(request.url)
  const token = url?.searchParams?.get("token")
  if (!token) return null
  setLocalStorage("token", token, -1)
  const current = removeUrlParams(window.location.href, ["token"])
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}${current.search}`,
  )
  return null
}
