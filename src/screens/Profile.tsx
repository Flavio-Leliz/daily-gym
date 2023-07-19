import { Avatar } from '@components/Avatar'
import { Button } from '@components/Button'
import { Input } from '@components/Input'
import { ScreenHeader } from '@components/ScreenHeader'
import defaultAvatar from '@assets/userPhotoDefault.png'
import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from 'native-base'
import { useState } from 'react'
import { TouchableOpacity } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAuth } from '@hooks/useAuth'
import { api } from '@services/api'
import { AppError } from '@utils/AppError'

const avatar_size = 33

type FormDataProps = {
    name: string
    email: string
    current_password: string
    new_password: string
    confirm_password: string
}

const formDataSchema = yup.object({
    name: yup
        .string()
        .required('Digite seu nome'),
    current_password: yup
        .string(),
    new_password: yup
        .string().min(8, 'Senha deve conter no mínimo 8 dígitos')
        .nullable()
        .transform((value) => !!value ? value : null),
    confirm_password: yup
        .string()
        .nullable()
        .transform((value) => !!value ? value : null)
        .oneOf([yup.ref('new_password'), null], 'Senha incorreta')
        .when('new_password', {
            is: (Field: any) => Field,
            then: (schema) => schema
                .nullable()
                .required('Digite a nova senha novamente')
                .transform((value) => !!value ? value : null)
        })
})

export function Profile() {
    const [isLoading, setIsLoading] = useState(false)
    const toast = useToast()
    const { user, updateProfile } = useAuth()

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<FormDataProps>({
        defaultValues: {
            name: user.name,
            email: user.email
        },
        resolver: yupResolver(formDataSchema)
    })

    async function handleProfileUpdate(data: FormDataProps) {
        try {
            setIsLoading(true)

            const userUpdated = user
            userUpdated.name = data.name

            await api.put('/users', {
                name: data.name,
                password: data.new_password,
                old_password: data.current_password
            })

            await updateProfile(userUpdated)

            toast.show({
                title: 'Perfil atualizada',
                placement: 'top',
                bgColor: 'green.700'
            })

        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message :
                'Não foi possível atualizar os dados. Tente novamente mais tarte'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.700'
            })
        } finally {
            setIsLoading(false)
        }
    }

    async function handleUserAvatar() {
        setIsLoading(true)
        try {
            const avatarSelected = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true
            })


            if (avatarSelected.canceled) {
                return
            }
            if (avatarSelected.assets[0].uri) {
                const avatarInfo = await FileSystem.getInfoAsync(avatarSelected.assets[0].uri)

                if (avatarInfo.exists && (avatarInfo.size / 1024 / 1024) > 5) {
                    return toast.show({
                        title: 'Essa imagem é muito grante. Tente com uma de até 5MB',
                        placement: 'top',
                        bgColor: 'red.500',
                    })
                }

                const fileExtension = avatarSelected.assets[0].uri.split('.').pop()
                const avatarFile = {
                    name: `${user.name}.${fileExtension}`.toLocaleLowerCase(),
                    uri: avatarSelected.assets[0].uri,
                    type: `${avatarSelected.assets[0].type}/${fileExtension}`
                }

                const updateUserAvatarForm = new FormData()
                updateUserAvatarForm.append('avatar', avatarFile)

                const avatarResponse = await api.patch('/users/avatar', updateUserAvatarForm, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                const updateUserAvatar = user
                updateUserAvatar.avatar = avatarResponse.data.avatar
                updateProfile(updateUserAvatar)

                toast.show({
                    title: 'Foto atualizada',
                    placement: 'top',
                    bgColor: 'green.700'
                })

            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <VStack flex={1}>
            <ScreenHeader title={user.name} />

            <ScrollView>
                <Center
                    mt={6}
                    mb={9}
                    px={10}
                >
                    {isLoading ?

                        <Skeleton
                            w={avatar_size}
                            h={avatar_size}
                            rounded='full'
                            startColor='gray.500'
                            endColor='gray.400'
                        />
                        :
                        <Avatar
                            source={user.avatar ? { uri: `${api.defaults.baseURL}avatar/${user.avatar}` } : defaultAvatar}
                            alt='Imagem de perfil'
                            size={avatar_size}
                        />
                    }

                    <TouchableOpacity>
                        <Text
                            color='green.500'
                            fontWeight='bold'
                            fontSize='lg'
                            mt={2}
                            mb={4}

                            onPress={handleUserAvatar}
                        >
                            Alterar foto
                        </Text>
                    </TouchableOpacity>

                    <Controller
                        control={control}
                        name='name'
                        render={({ field: { onChange, value } }) => (
                            <Input
                                bg='gray.600'
                                placeholder='Nome'
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.name?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name='email'
                        render={() => (
                            <Input
                                bg='gray.600'
                                placeholder='E-mail'
                                isDisabled
                            />
                        )}
                    />

                    <Heading
                        color='gray.200'
                        fontSize='md'
                        fontFamily='heading'
                        mt={2}
                        alignSelf='flex-start'
                    >
                        Alterar senha
                    </Heading>

                    <Controller
                        control={control}
                        name='current_password'
                        render={({ field: { onChange } }) => (
                            <Input
                                bg='gray.600'
                                placeholder='Senha atual'
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors.current_password?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name='new_password'
                        render={({ field: { onChange } }) => (
                            <Input
                                bg='gray.600'
                                placeholder='Nova senha'
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors.new_password?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name='confirm_password'
                        render={({ field: { onChange } }) => (
                            <Input
                                bg='gray.600'
                                placeholder='Confirmar senha'
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors.confirm_password?.message}
                                onSubmitEditing={handleSubmit(handleProfileUpdate)}
                                returnKeyType='send'
                            />
                        )}
                    />
                    <Button
                        title='Atualizar'
                        onPress={handleSubmit(handleProfileUpdate)}
                        isLoading={isLoading}
                    />
                </Center>

            </ScrollView>

        </VStack>
    )
}