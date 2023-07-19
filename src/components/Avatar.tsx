import { IImageProps, Image } from 'native-base'

type AvatarProps = IImageProps & {
    size: number
}

export function Avatar({ size, ...rest }: AvatarProps) {
    return (
        <Image
            w={size}
            h={size}
            rounded='full'
            borderWidth={2}
            borderColor='gray.400'

            {...rest}
        />
    )
}