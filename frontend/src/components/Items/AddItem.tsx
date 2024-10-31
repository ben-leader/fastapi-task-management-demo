import {
    Button,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitHandler, useForm } from "react-hook-form";

import { type ApiError, type ItemCreate, ItemsService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";
import { handleError } from "../../utils";

interface AddItemProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddItem = ({ isOpen, onClose }: AddItemProps) => {
    const queryClient = useQueryClient();
    const showToast = useCustomToast();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ItemCreate>({
        mode: "onBlur",
        criteriaMode: "all",
        defaultValues: {
            title: "",
            description: "",
            due_date: "",
        },
    });

    const mutation = useMutation({
        mutationFn: (data: ItemCreate) =>
            ItemsService.createItem({ requestBody: data }),
        onSuccess: () => {
            showToast("Success!", "Item created successfully.", "success");
            reset();
            onClose();
        },
        onError: (err: ApiError) => {
            handleError(err, showToast);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["items"] });
        },
    });

    const onSubmit: SubmitHandler<ItemCreate> = (data) => {
        const formattedData = {
            ...data,
            due_date: data.due_date
                ? new Date(data.due_date).toISOString()
                : null,
        };
        console.log(formattedData);

        mutation.mutate(formattedData);
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                size={{ base: "sm", md: "md" }}
                isCentered
            >
                <ModalOverlay />
                <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
                    <ModalHeader>Add Item</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl isRequired isInvalid={!!errors.title}>
                            <FormLabel htmlFor="title">Title</FormLabel>
                            <Input
                                id="title"
                                {...register("title", {
                                    required: "Title is required.",
                                })}
                                placeholder="Title"
                                type="text"
                            />
                            {errors.title && (
                                <FormErrorMessage>
                                    {errors.title.message}
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl mt={4}>
                            <FormLabel htmlFor="description">
                                Description
                            </FormLabel>
                            <Input
                                id="description"
                                {...register("description")}
                                placeholder="Description"
                                type="text"
                            />
                        </FormControl>

                        <FormControl mt={4}>
                            <FormLabel htmlFor="due_date">Due Date</FormLabel>
                            <Input
                                id="due_date"
                                {...register("due_date")}
                                type="date"
                            />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter gap={3}>
                        <Button
                            variant="primary"
                            type="submit"
                            isLoading={isSubmitting}
                        >
                            Save
                        </Button>
                        <Button onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default AddItem;
