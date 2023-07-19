import { HStack, Heading, Center } from 'native-base'

type ScreenHeaderProps = {
    title: string
}

export function ScreenHeader({ title }: ScreenHeaderProps) {
    return (
        <Center
            bg='gray.600'
            pt={16}
            pb={6}
        >
            <Heading
                color='gray.100'
                fontSize='xl'
                fontFamily='heading'
                textTransform='capitalize'
            >
                {title}
            </Heading>
        </Center>
    )
}