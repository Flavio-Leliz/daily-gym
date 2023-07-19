import { Button as ButtonNativeBase, IButtonProps, Text } from 'native-base'

type ButtonProps = IButtonProps & {
    title: string
    variant?: 'solid' | 'outline'
}

export function Button({ title, variant = 'solid', ...rest }: ButtonProps) {
    return (
        <ButtonNativeBase
            bg={variant === 'outline' ? 'transparent' : 'green.700'}
            borderWidth={variant === 'outline' ? 1 : 0}
            borderColor='green.500'
            h={12}
            w='full'
            px={4}
            rounded='sm'
            mt={4}
            _pressed={{
                bg: 'green.500',
            }}

            {...rest}
        >
            <Text
                fontSize='sm'
                fontFamily='heading'
                color='white'

            >
                {title}
            </Text>
        </ButtonNativeBase >
    )
}