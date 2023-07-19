import { storageAuthTokenGet, storageAuthTokenSave } from '@storage/storageAuthToken'
import { AppError } from '@utils/AppError'
import axios, { AxiosError, AxiosInstance } from 'axios'

type SignOut = () => void

type PromiseType = {
    onSuccess: (token: string) => void
    onFailure: (error: AxiosError) => void
}

type ApiInstanceProps = AxiosInstance & {
    registerInterceptTokenManager: (SignOut: SignOut) => () => void
}

const api = axios.create({
    baseURL: 'http://192.168.0.109:3333/'
}) as ApiInstanceProps

let failedQueue: Array<PromiseType> = []
let isRefreshing = false

api.registerInterceptTokenManager = signOut => {
    const interceptTokenManager = api.interceptors.response.use((response) => response, async (requestError) => {
        if (requestError?.response?.status === 401) {
            if (requestError.response.data?.message === 'token.expired'
                || requestError.response.data?.message === 'token.invalid') {

                const { refresh_token } = await storageAuthTokenGet()

                if (!refresh_token) {
                    signOut()
                    return Promise.reject(requestError)
                }

                const firstRequestConfig = requestError.config
                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({
                            onSuccess: (token: string) => {
                                firstRequestConfig.headers = { 'Authorization': `Bearer ${token}` }
                                resolve(api(firstRequestConfig))
                            },
                            onFailure: (error: AxiosError) => {
                                reject(error)
                            }
                        })
                    })
                }
                isRefreshing = true

                return new Promise(async (resolve, reject) => {
                    try {
                        const { data } = await api.post('/sessions/refresh-token', { refresh_token })
                        await storageAuthTokenSave({ token: data.token, refresh_token: data.refresh_token })

                        if (firstRequestConfig.data) {
                            firstRequestConfig.data = JSON.parse(firstRequestConfig.data)
                        }

                        firstRequestConfig.headers = { 'Authorization': `Bearer ${data.token}` }
                        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

                        failedQueue.forEach((request) => {
                            request.onSuccess(data.token)
                        })
                        resolve(api(firstRequestConfig))

                    } catch (error: any) {
                        failedQueue.forEach((request) => {
                            request.onFailure(error)
                        })
                        signOut()
                        reject(error)

                    } finally {
                        isRefreshing = false
                        failedQueue = []
                    }
                })


            }
            // signOut()
        }


        if (requestError.response && requestError.response.data) {
            return Promise.reject(new AppError(requestError.response.data.message))
        } else {
            return Promise.reject(requestError)
        }
    })

    return () => {
        api.interceptors.response.eject(interceptTokenManager)
    }
}

export { api }