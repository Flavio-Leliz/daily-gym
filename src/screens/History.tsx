import { HistoryCard } from '@components/HistoryCard'
import { Loading } from '@components/Loading'
import { ScreenHeader } from '@components/ScreenHeader'
import { HistorySectionDTO } from '@dtos/HistorySectionDTO'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '@services/api'
import { AppError } from '@utils/AppError'
import { Box, Center, Heading, SectionList, Text, VStack, View, useToast } from 'native-base'
import { useCallback, useState } from 'react'
import { Platform } from 'react-native'

export function History() {
    const [isLoading, setIsLoading] = useState(true)
    const [exercises, setExercises] = useState<HistorySectionDTO[]>([])
    const toast = useToast()

    async function fetchHistory() {
        try {
            setIsLoading(true)
            const response = await api.get('/history')
            setExercises(response.data)

        } catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Não foi possível carregar o histórico'

            toast.show({
                title,
                placement: 'top',
                bgColor: 'red.500'
            })
        } finally {
            setIsLoading(false)
        }
    }

    useFocusEffect(useCallback(() => {
        fetchHistory()
    }, []))

    return (
        <VStack
            bg='gray700'
        >
            <ScreenHeader title='histórico de exercícios' />

            {isLoading ? <Center mt='full'><Loading /></Center> :
                <SectionList
                    sections={exercises}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <HistoryCard data={item} />
                    )}

                    renderSectionHeader={({ section }) => (
                        <Heading
                            color='gray.200'
                            fontSize='md'
                            fontFamily='heading'
                            mt={10}
                            mb={3}
                        >
                            {section.title}
                        </Heading>
                    )}

                    px={8}
                    contentContainerStyle={[
                        {
                            paddingBottom: Platform.OS === 'ios' ? 20 : 120
                        },
                        exercises.length === 0 && { height: '100%', justifyContent: 'center' }
                    ]}
                    showsVerticalScrollIndicator={false}

                    ListEmptyComponent={() => (
                        <Text color='gray.100' textAlign='center'>
                            Histórico vazio
                        </Text>
                    )}
                />
            }
        </VStack>
    )
}