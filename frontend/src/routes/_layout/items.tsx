import {
    Button,
    Container,
    Heading,
    SkeletonText,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

import { ApiError, ItemsService, ItemPublic } from "../../client";
import ActionsMenu from "../../components/Common/ActionsMenu";
import Navbar from "../../components/Common/Navbar";
import AddItem from "../../components/Items/AddItem";
import { PaginationFooter } from "../../components/Common/PaginationFooter.tsx";
import { handleError } from "../../utils.ts";
import useCustomToast from "../../hooks/useCustomToast.ts";

const itemsSearchSchema = z.object({
    page: z.number().catch(1),
});

export const Route = createFileRoute("/_layout/items")({
    component: Items,
    validateSearch: (search) => itemsSearchSchema.parse(search),
});

const PER_PAGE = 5;

function getItemsQueryOptions({
    page,
    status,
}: {
    page: number;
    status: string;
}) {
    return {
        queryFn: () =>
            ItemsService.readItems({
                skip: (page - 1) * PER_PAGE,
                limit: PER_PAGE,
                status,
            }),
        queryKey: ["items", { page, status }],
    };
}

function ItemsTable() {
    const queryClient = useQueryClient();
    const showToast = useCustomToast();
    const { page } = Route.useSearch();
    const navigate = useNavigate({ from: Route.fullPath });
    const setPage = (page: number) =>
        navigate({
            search: (prev: { [key: string]: string }) => ({ ...prev, page }),
        });
    const [status, setStatus] = useState("todo");

    const completeTaskMutation = useMutation({
        mutationFn: (data: ItemPublic) => {
            const updateRequest = { ...data, status: "complete" };
            return ItemsService.updateItem({
                id: data.id,
                requestBody: updateRequest,
            });
        },
        onSuccess: () => {
            showToast("Success!", "Task completed.", "success");
        },
        onError: (err: ApiError) => {
            handleError(err, showToast);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
        },
    });

    const {
        data: items,
        isPending,
        isPlaceholderData,
    } = useQuery({
        ...getItemsQueryOptions({ page, status }),
        placeholderData: (prevData) => prevData,
    });

    const hasNextPage = !isPlaceholderData && items?.data.length === PER_PAGE;
    const hasPreviousPage = page > 1;

    useEffect(() => {
        if (hasNextPage) {
            queryClient.prefetchQuery(
                getItemsQueryOptions({ page: page + 1, status })
            );
        }
    }, [page, queryClient, hasNextPage]);

    return (
        <>
            <Button
                onClick={() =>
                    setStatus(status === "todo" ? "complete" : "todo")
                }
            >
                {status === "todo" ? "Show Completed" : "Show To Do"}
            </Button>
            <TableContainer>
                <Table size={{ base: "sm", md: "md" }}>
                    <Thead>
                        <Tr>
                            <Th>Title</Th>
                            <Th>Description</Th>
                            <Th>Due Date</Th>
                            <Th>Actions</Th>
                            {status === "todo" && <Th></Th>}
                        </Tr>
                    </Thead>
                    {isPending ? (
                        <Tbody>
                            <Tr>
                                {new Array(4).fill(null).map((_, index) => (
                                    <Td key={index}>
                                        <SkeletonText
                                            noOfLines={1}
                                            paddingBlock="16px"
                                        />
                                    </Td>
                                ))}
                            </Tr>
                        </Tbody>
                    ) : (
                        <Tbody>
                            {items?.data.map((item) => (
                                <Tr
                                    key={item.id}
                                    opacity={isPlaceholderData ? 0.5 : 1}
                                >
                                    <Td isTruncated maxWidth="150px">
                                        {item.title}
                                    </Td>
                                    <Td
                                        color={
                                            !item.description
                                                ? "ui.dim"
                                                : "inherit"
                                        }
                                        isTruncated
                                        maxWidth="150px"
                                    >
                                        {item.description || "N/A"}
                                    </Td>
                                    <Td>
                                        {item.due_date
                                            ? new Date(
                                                  item.due_date
                                              ).toLocaleDateString()
                                            : "N/A"}
                                    </Td>
                                    <Td>
                                        <ActionsMenu
                                            type={"Item"}
                                            value={item}
                                        />
                                    </Td>
                                    {status === "todo" && (
                                        <Td>
                                            <Button
                                                onClick={() =>
                                                    completeTaskMutation.mutate(
                                                        item
                                                    )
                                                }
                                            >
                                                Complete
                                            </Button>
                                        </Td>
                                    )}
                                </Tr>
                            ))}
                        </Tbody>
                    )}
                </Table>
            </TableContainer>
            <PaginationFooter
                page={page}
                onChangePage={setPage}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
            />
        </>
    );
}

function Items() {
    return (
        <Container maxW="full">
            <Heading
                size="lg"
                textAlign={{ base: "center", md: "left" }}
                pt={12}
            >
                Items Management
            </Heading>

            <Navbar type={"Item"} addModalAs={AddItem} />
            <ItemsTable />
        </Container>
    );
}
