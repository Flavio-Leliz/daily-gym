import { IPressableProps, Pressable, Text } from 'native-base'

type FilterProps = IPressableProps & {
    name: string
    isActive: boolean
}

export function Filter({ name, isActive, ...rest }: FilterProps) {
    return (

        <Pressable
            mr={3}
            w={24}
            h={10}
            bg='gray.600'
            rounded='md'
            justifyContent='center'
            alignItems='center'
            overflow='hidden'
            isPressed={isActive}
            _pressed={{
                borderColor: 'green.500',
                borderWidth: 1
            }}

            {...rest}
        >
            <Text
                color={isActive ? 'green.500' : 'gray.200'}
                textTransform='uppercase'
                fontSize='xs'
                fontFamily='body'
            >
                {name}
            </Text>
        </Pressable>
    )
}