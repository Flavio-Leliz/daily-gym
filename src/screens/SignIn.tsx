import { Center, Heading, Image, ScrollView, Text, VStack, useToast } from 'native-base'

import LogoSvg from '@assets/logo.svg'
import BackgroundImg from '@assets/background.png'
import { Input } from '@components/Input'
import { Button } from '@components/Button'
import { useNavigation } from '@react-navigation/native'
import { AuthNavigatorRoutesProps } from '@routes/auth.routes'
import { Controller, useForm } from 'react-hook-form'
import { useAuth } from '@hooks/useAuth'
import { AppError } from '@utils/AppError'
import { useState } from 'react'

type formDataProps = {
    email: string
    password: string
}

export function SignIn() {
    const navigation = useNavigation<AuthNavigatorRoutesProps>()
    const { signIn } = useAuth()
    const toast = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<formDataProps>()

    async function handleSignIn({ email, password }: formDataProps) {
        try {
            setIsLoading(true)
            await signIn(email, password)
        } catch (error) {
            const isAppError = error instanceof AppError

            const title = isAppError ? error.message : 'Falha no login. Tente novamente mais tarte'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            })
            setIsLoading(false)
        }
    }

    function handleNewAccount() {
        navigation.navigate('signUp')
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
                        Acesse sua conta
                    </Heading>

                    <Controller
                        control={control}
                        name='email'
                        rules={{ required: 'Informe seu e-mail' }}
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
                        rules={{ required: 'Informe sua senha' }}
                        render={({ field: { onChange, value } }) => (
                            <Input
                                placeholder='Senha'
                                secureTextEntry
                                onChangeText={onChange}
                                returnKeyType='send'
                                onSubmitEditing={handleSubmit(handleSignIn)}
                                errorMessage={errors.password?.message}
                            />
                        )}
                    />
                    <Button
                        title='Acessar'
                        onPress={handleSubmit(handleSignIn)}
                        isLoading={isLoading}
                    />

                </Center>

                <Center mt={32}>
                    <Text
                        color='gray.100'
                        fontSize='md'
                        fontFamily='body'
                    >
                        Ainda não tem acesso?
                    </Text>
                    <Button
                        title='Criar conta'
                        variant='outline'
                        onPress={handleNewAccount}
                    />
                </Center>
            </VStack>
        </ScrollView>
    )
}