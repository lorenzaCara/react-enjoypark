import CategoryItem from "@/components/CategoryItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/contexts/CategoriesProvider";
import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusIcon, TriangleAlertIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const categorySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Il nome della categoria è obbligatorio" }),
});

const CategoriesPage = () => {
  const { categories, createCategory } = useCategories();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError
  } = useForm({
    //resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await createCategory({ name: data.name });
      reset();
    } catch (error) {
      console.log(error);
      error.issues?.forEach((issue) => {
        const field = issue.path[1];
        setError(field, {
          types: { [issue.code]: issue.message }
        });
      })
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 mx-auto">
      <h1 className="mb-6 text-3xl font-bold text-center">
        Gestione Categorie
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Nuova Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          {/* FORM */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-2">
              <Input
                id="name"
                placeholder="Nome della categoria"
                {...register("name")}
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <PlusIcon className="w-4 h-4 mr-2" />
                )}
                Crea categoria
              </Button>
            </div>
            <ErrorMessage
              errors={errors}
              name="name"
              render={({ messages }) =>
                  messages &&
                  Object.entries(messages).map(([type, message]) => (
                  <p className="text-destructive text-xs" key={type}>{message}</p>
                  ))
              }
            />
          </form>

          {/* CATEGORIES LIST */}
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 mt-8 border rounded-md">
              <TriangleAlertIcon className="w-12 h-12 text-amber-400 opacity-60" />
              <p className="text-lg font-medium opacity-60">
                No categories found
              </p>
            </div>
          ) : (
            // CATEGORIES LIST
            <ul className="mt-8 space-y-2">
              {categories.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesPage;
