import { Input as InputNativeBase, IInputProps, FormControl } from 'native-base'

type InputProps = IInputProps & {
    errorMessage?: string | null
}

export function Input({ errorMessage = null, isInvalid, ...rest }: InputProps) {
    const invalid = !!errorMessage || isInvalid

    return (
        <FormControl isInvalid={invalid} mb={4}>
            <InputNativeBase
                bg='gray.700'
                h={12}
                px={4}
                rounded='sm'
                borderWidth={0}
                fontSize='sm'
                fontFamily='body'
                color='white'
                placeholderTextColor='gray.300'

                _focus={{
                    bg: 'gray.700',
                    borderWidth: 1,
                    borderColor: 'green.500'
                }}

                {...rest}
            />
            <FormControl.ErrorMessage>
                {errorMessage}
            </FormControl.ErrorMessage>
        </FormControl>
    )
}