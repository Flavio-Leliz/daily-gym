import { Center, Heading, Image, ScrollView, Text, VStack, useToast } from 'native-base'
import LogoSvg from '@assets/logo.svg'
import BackgroundImg from '@assets/background.png'
import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { useNavigation } from '@react-navigation/native'
import { AuthNavigatorRoutesProps } from '@routes/auth.routes'
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { useState } from 'react'
import { useAuth } from '@hooks/useAuth'

type formDataProps = {
    name: string
    email: string
    password: string
    confirm_password: string
}

const signUpFormSchema = yup.object({
    name: yup.string().required('Digite seu nome'),
    email: yup.string().required('Digite seu e-mail').email('E-mail inválido'),
    password: yup.string().required('Digite sua senha').min(8, 'Senha deve conter no mínimo 8 dígitos'),
    confirm_password: yup.string().required('Digite sua senha novamente')
        .oneOf([yup.ref('password')], 'Senha incorreta')
})

export function SignUp() {
    const navigation = useNavigation<AuthNavigatorRoutesProps>()
    const toast = useToast()
    const { signIn } = useAuth()

    const [isLoading, setIsLoading] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<formDataProps>({
        resolver: yupResolver(signUpFormSchema)
    })

    function handleGoBack() {
        navigation.goBack()
    }

    async function handleSignUp({ name, email, password }: formDataProps) {
        try {
            setIsLoading(true)
            await api.post('/users', { name, email, password })
            await signIn(email, password)

        } catch (error) {
            setIsLoading(false)
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Não foi possível criar conta. Tente novamente mais tarte'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500',
            })
        }
    }

    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
        >
            <VStack
                flex={1}
                px={10}
            >
                <Image
                    source={BackgroundImg}
                    defaultSource={BackgroundImg}
                    alt='Pessoas treinando'
                    resizeMode='contain'
                    position='absolute'
                />

                <Center my={32}>
                    <LogoSvg />
                    <Text color='gray.100' fontSize='sm'>
                        Treine sua mente e o seu corpo
                    </Text>
                </Center>

                <Center>
                    <Heading
                        color='gray.100'
                        fontSize='xl'
                        fontFamily='heading'
                        mb={6}
                    >
                        Crie sua conta
                    </Heading>

                    <Controller
                        control={control}
                        name='name'
                        render={({ field: { onChange, value } }) => (
                            <Input
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
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder='E-mail'
                                keyboardType='email-address'
                                autoCapitalize='none'
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.email?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='password'
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder='Senha'
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors.password?.message}
                            />
                        )}
                    />
                    <Controller
                        control={control}
                        name='confirm_password'
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder='Confirmar senha'
                                secureTextEntry
                                onChangeText={onChange}
                                onSubmitEditing={handleSubmit(handleSignUp)}
                                returnKeyType='send'
                                errorMessage={errors.confirm_password?.message}
                            />
                        )}
                    />

                    <Button
                        title='Criar e acessar'
                        onPress={handleSubmit(handleSignUp)}
                        isLoading={isLoading}
                    />
                </Center>

                <Button
                    mt={10}
                    title='Voltar para o login'
                    variant='outline'
                    onPress={handleGoBack}
                />

            </VStack>
        </ScrollView>
    )
}