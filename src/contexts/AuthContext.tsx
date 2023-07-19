import { UserDTO } from '@dtos/UserDTO'
import { api } from '@services/api'
import { storageAuthTokenGet, storageAuthTokenSave, storageTokenDelete } from '@storage/storageAuthToken'
import { storageUserDelete, storageUserGet, storageUserSave } from '@storage/storageUser'
import { ReactNode, createContext, useEffect, useState } from 'react'

export type AuthContextDataProps = {
    user: UserDTO
    updateProfile: (userUpdate: UserDTO) => Promise<void>
    signIn: (email: string, password: string) => Promise<void>
    isLoadingUserStorageData: boolean
    signOut: () => Promise<void>
}

type AuthContextProviderProps = {
    children: ReactNode
}

export const AuthContext = createContext<AuthContextDataProps>({} as AuthContextDataProps)

export function AuthContextProvider({ children }: AuthContextProviderProps) {
    const [user, setUser] = useState<UserDTO>({} as UserDTO)
    const [isLoadingUserStorageData, setIsLoadingUserStorageData] = useState(true)

    async function userAndTokenUpdate(userData: UserDTO, token: string) {
        try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            setUser(userData)
        } catch (error) {
            throw error
        }
    }

    async function storageUserAndTokenSave(userData: UserDTO, token: string, refresh_token: string) {
        try {
            setIsLoadingUserStorageData(true)

            await storageUserSave(userData)
            await storageAuthTokenSave({ token, refresh_token })
        } catch (error) {
            throw error
        } finally {
            setIsLoadingUserStorageData(false)
        }
    }

    async function signIn(email: string, password: string) {
        try {
            setIsLoadingUserStorageData(true)
            const { data } = await api.post('/sessions', { email, password })

            if (data.user && data.token && data.refresh_token) {
                await storageUserAndTokenSave(data.user, data.token, data.refresh_token)

                userAndTokenUpdate(data.user, data.token)
            }
        } catch (error) {
            throw error
        } finally {
            setIsLoadingUserStorageData(false)
        }
    }

    async function signOut() {
        try {
            setIsLoadingUserStorageData(true)
            setUser({} as UserDTO)

            await storageUserDelete()
            await storageTokenDelete()
        } catch (error) {
            throw error
        } finally {
            setIsLoadingUserStorageData(false)
        }
    }

    async function updateProfile(userUpdate: UserDTO) {
        try {
            setUser(userUpdate)
            await storageUserSave(userUpdate)
        } catch (error) {
            throw error
        }
    }

    async function loadUserData() {
        try {
            const userLogged = await storageUserGet()
            const { token } = await storageAuthTokenGet()

            if (token && userLogged) {
                userAndTokenUpdate(userLogged, token)
            }
        } catch (error) {
            throw error
        } finally {
            setIsLoadingUserStorageData(false)
        }
    }
    useEffect(() => {
        loadUserData()
    }, [])

    useEffect(() => {
        const subscribe = api.registerInterceptTokenManager(signOut)

        return () => {
            subscribe()
        }
    }, [signOut])

    return (
        <AuthContext.Provider value={{
            user,
            signIn,
            isLoadingUserStorageData,
            signOut,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider >
    )
}