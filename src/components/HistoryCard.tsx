import { HistoryDTO } from '@dtos/HistoryDTO'
import { HStack, Heading, Text, VStack } from 'native-base'

type HistoryCardProps = {
    data: HistoryDTO
}

export function HistoryCard({ data }: HistoryCardProps) {
    return (
        <HStack
            bg='gray.600'
            mb={3}
            py={5}
            px={4}
            rounded='md'
            alignItems='center'
            justifyContent='space-between'
        >
            <VStack flex={1}>
                <Heading
                    color='white'
                    fontSize='md'
                    fontFamily='heading'
                    textTransform='capitalize'
                    numberOfLines={1}
                >
                    {data.group}
                </Heading>

                <Text
                    color='gray.100'
                    fontSize='lg'
                    fontFamily='body'
                    numberOfLines={1}
                >
                    {data.name}
                </Text>
            </VStack>

            <Text
                color='gray.300'
                fontSize='md'
                fontFamily='body'
            >
                {data.hour}
            </Text>
        </HStack>
    )
}