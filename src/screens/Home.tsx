import { ExerciseCard } from '@components/ExerciseCard'
import { Filter } from '@components/Filter'
import { Header } from '@components/HeaderHome'
import { Loading } from '@components/Loading'
import { ExerciseDTO } from '@dtos/ExerciseDTO'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { AppNavigatorRoutesProps } from '@routes/app.routes'
import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { FlatList, HStack, Heading, Text, VStack, useToast } from 'native-base'
import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'

export function Home() {
    const [filterOptions, setFilterOptions] = useState<string[]>([])
    const [filterSelected, setFilterSelected] = useState('antebraço')
    const [exercises, setExercises] = useState<ExerciseDTO[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const toast = useToast()

    const navigation = useNavigation<AppNavigatorRoutesProps>()

    function handleExerciseDetails(exerciseId: string) {
        navigation.navigate('exercise', { exerciseId })
    }

    async function fetchFilters() {
        try {
            const response = await api.get('/groups')
            setFilterOptions(response.data)

        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Não foi possível carregar filtro'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            })
        }
    }
    async function fetchExercises() {
        try {
            setIsLoading(true)
            const response = await api.get(`/exercises/bygroup/${filterSelected}`)
            setExercises(response.data)

        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Não foi possível carregar os exercícios'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchFilters()
    }, [])

    useFocusEffect(useCallback(() => {
        fetchExercises()
    }, [filterSelected]))

    return (
        <VStack flex={1}>
            <Header />

            <FlatList
                data={filterOptions}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                    <Filter
                        name={item}
                        isActive={filterSelected.toLocaleLowerCase() === item.toLocaleLowerCase()}
                        onPress={() => setFilterSelected(item)}
                    />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                _contentContainerStyle={{ px: 8 }}
                my={10}
                maxH={10}
                minH={10}
            />

            {isLoading ? <Loading /> :
                <VStack padding={8} flex={1}>
                    <HStack justifyContent='space-between'>
                        <Heading
                            color='gray.200'
                            fontSize='md'
                            fontFamily='heading'
                            mb={3}
                        >
                            Exercícios
                        </Heading>
                        <Text
                            color='gray.200'
                            fontSize='sm'
                        >
                            {exercises.length}
                        </Text>
                    </HStack>

                    <FlatList
                        data={exercises}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <ExerciseCard
                                onPress={() => handleExerciseDetails(item.id)}
                                data={item}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        _contentContainerStyle={{
                            paddingBottom: Platform.OS === 'ios' ? 20 : 20
                        }}
                    />

                </VStack>
            }
        </VStack>
    )
}