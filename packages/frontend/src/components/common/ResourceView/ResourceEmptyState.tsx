import { Center, Flex, Text, Title } from '@mantine/core';
import { FC } from 'react';

export interface ResourceEmptyStateProps {
    icon?: JSX.Element;
    title?: string;
    description?: string;
    action?: JSX.Element;
}

const ResourceEmptyState: FC<ResourceEmptyStateProps> = ({
    icon,
    title = 'No items',
    description,
    action,
}) => {
    return (
        <Center component={Flex} direction="column" gap="md" py={40}>
            {icon}

            <Center component={Flex} direction="column" gap={4}>
                <Title order={4} fw={500}>
                    {title}
                </Title>

                {description && <Text color="gray.6">{description}</Text>}
            </Center>

            {action}
        </Center>
    );
};

export default ResourceEmptyState;
