import { Box, HStack, Heading, Icon, Image, ScrollView, Text, VStack, useToast } from 'native-base'
import { Feather } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native'

import BodySvg from '@assets/body.svg'
import SeriesSvg from '@assets/series.svg'
import RepetitionSvg from '@assets/repetitions.svg'

import { Button } from '@components/Button'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { AppError } from '@utils/AppError'
import { api } from '@services/api'
import { useEffect, useState } from 'react'
import { ExerciseDTO } from '@dtos/ExerciseDTO'
import { Loading } from '@components/Loading'
import { History } from './History'

type RouteParamsProps = {
    exerciseId: string
}

export function Exercise() {
    const [exerciseInfo, setExerciseInfo] = useState<ExerciseDTO>({} as ExerciseDTO)
    const [isLoading, setIsLoading] = useState(true)
    const [sendingRegister, setSendingRegister] = useState(false)
    const navigation = useNavigation<AppNavigatorRoutesProps>()
    const route = useRoute()

    const toast = useToast()

    const { exerciseId } = route.params as RouteParamsProps

    function handleGoBack() {
        navigation.goBack()
    }

    async function fetchExerciseDetails() {
        try {
            setIsLoading(true)
            const response = await api.get(`/exercises/${exerciseId}`)
            setExerciseInfo(response.data)

        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Não foi possível carregar detalhes do exercício'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            })
        } finally {
            setIsLoading(false)
        }
    }
    async function handleExerciseRegister() {
        try {
            setSendingRegister(true)
            await api.post('/history', { exercise_id: exerciseId })

            toast.show({
                title: 'Exercício registrado',
                placement: 'top',
                bgColor: 'green.700'
            })

            navigation.navigate('history')

        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Não foi possível registrar o exercício'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            })
        } finally {
            setSendingRegister(false)
        }
    }

    useEffect(() => {
        fetchExerciseDetails()
    }, [exerciseId])

    return (
        <VStack flex={1}>
            <VStack
                bg='gray.600'
                pt={12}
                px={8}
            >
                <TouchableOpacity onPress={handleGoBack}>
                    <Icon
                        as={Feather}
                        name='arrow-left'
                        color='green.500'
                        size={6}
                    />
                </TouchableOpacity>

                <HStack
                    mt={4}
                    mb={8}
                    justifyContent='space-between'
                    alignItems='center'
                >
                    <Heading
                        color='gray.100'
                        fontSize='xl'
                        fontFamily='heading'
                        flexShrink={1}
                    >
                        {exerciseInfo.name}
                    </Heading>

                    <HStack alignItems='center'>
                        <BodySvg />
                        <Text
                            ml={1}
                            color='gray.200'
                            fontSize='md'
                            textTransform='capitalize'
                        >
                            {exerciseInfo.group}
                        </Text>
                    </HStack>
                </HStack>
            </VStack>

            {isLoading ? <Loading /> :
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>

                    <VStack
                        px={8}
                        mt={8}

                    >
                        <Box rounded='lg' mb={3} overflow='hidden'>
                            <Image
                                w='full'
                                h={80}
                                source={{ uri: `${api.defaults.baseURL}exercise/demo/${exerciseInfo.demo}` }}
                                alt='Nome do exercício'
                                resizeMode='cover'
                            />
                        </Box>

                        <Box
                            bg='gray.600'
                            p={4}
                            rounded='lg'
                        >
                            <HStack
                                alignItems='center'
                                justifyContent='space-around'
                                my={4}
                            >
                                <HStack>
                                    <SeriesSvg />
                                    <Text
                                        color='gray.200'
                                        fontSize='lg'
                                        ml={2}
                                    >
                                        {exerciseInfo.series} séries
                                    </Text>
                                </HStack>

                                <HStack>
                                    <RepetitionSvg />
                                    <Text
                                        color='gray.200'
                                        fontSize='lg'
                                        ml={2}
                                    >
                                        {exerciseInfo.repetitions} repetições
                                    </Text>
                                </HStack>
                            </HStack>

                            <Button
                                title='Marcar como realizado'
                                isLoading={sendingRegister}
                                onPress={handleExerciseRegister}
                            />
                        </Box>
                    </VStack>
                </ScrollView>
            }
        </VStack>
    )
}