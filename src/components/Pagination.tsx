import {Button, HStack, Text} from '@chakra-ui/react';

interface Props {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({page, totalPages, onPageChange}: Props) {
    if (totalPages <= 1) return null;

    return (
        <HStack justify="center" mt={4} gap={4}>
            <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => onPageChange(page - 1)}
            >
                Назад
            </Button>
            <Text fontSize="sm">
                Страница {page + 1} из {totalPages}
            </Text>
            <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => onPageChange(page + 1)}
            >
                Вперед
            </Button>
        </HStack>
    );
}