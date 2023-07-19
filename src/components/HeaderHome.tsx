import { HStack, Heading, Icon, Text, VStack } from 'native-base'
import { Avatar } from './Avatar'
import { MaterialIcons } from '@expo/vector-icons'
import { TouchableOpacity } from 'react-native'
import { useAuth } from '@hooks/useAuth'
import defaultAvatar from '@assets/userPhotoDefault.png'
import { api } from '@services/api'

export function Header() {
    const { user, signOut } = useAuth()

    return (
        <HStack
            bg='gray.600'
            pt={16}
            pb={5}
            px={8}
            alignItems='center'
        >
            <Avatar
                source={user.avatar ? { uri: `${api.defaults.baseURL}avatar/${user.avatar}` } : defaultAvatar}
                alt='Imagem de perfil'
                size={16}
                mr={4}

            />
            <VStack flex={1}>
                <Text
                    color='gray.100'
                    fontSize='md'
                >
                    Olá
                </Text>
                <Heading
                    color='gray.100'
                    fontSize='md'
                    fontFamily='heading'
                >
                    {user.name}
                </Heading>
            </VStack>

            <TouchableOpacity onPress={signOut}>
                <Icon
                    as={MaterialIcons}
                    name='logout'
                    color='gray.200'
                    size={7}
                />
            </TouchableOpacity>
        </HStack>
    )
}