import { Button } from "@/components/ui/button";
import { useCategories } from "@/contexts/CategoriesProvider";
import { Pencil, SaveIcon, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { ErrorMessage } from "@hookform/error-message";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Il nome della categoria è obbligatorio" }),
});

const CategoryItem = ({ category }) => {
  const {
    selectedCategory,
    setSelectedCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
    },
  });

  const onSubmit = async (data) => {
    setSelectedCategory(null);
    try {
      await updateCategory({ ...data, id: category.id });
    } catch (error) {
      // TODO: handle error
    }
  };

  const handleDelete = async () => {
    await deleteCategory(category.id);
  };

  return (
    <>
      <li
        className={cn(
          "flex items-center justify-between p-3 border rounded-md",
          selectedCategory &&
            selectedCategory.id !== category.id &&
            "opacity-20"
        )}
      >
        {selectedCategory?.id === category.id ? (
          // EDIT MODE
          <div className="flex flex-col w-full gap-2">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex items-center"
            >
              <Input type="text" {...register("name")} />
              <div className="flex gap-1 ml-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCategory()}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button>
                  <SaveIcon className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </div>
            </form>
            <ErrorMessage
              errors={errors}
              name="name"
              render={({ message }) => (
                <p className="text-sm text-red-500">{message}</p>
              )}
            />
          </div>
        ) : (
          // VIEW MODE
          <>
            {/* CATEGORY NAME */}
            <span className="font-medium capitalize truncate">
              {category.name}
            </span>
            {/* ACTIONS */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedCategory(category)}
              >
                <Pencil className="w-4 h-4 mr-1" />
                Modifica
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="text-red-500"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </li>

      {/* DELETE CONFIRMATION MODAL */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the &quot;{category.name}&quot;
              category? All the transactions associated with this category will
              be set as &quot;Uncategorized&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CategoryItem;
