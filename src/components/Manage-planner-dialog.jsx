import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Star, MapPin, HelpingHand, Clock, Save, Loader2 } from "lucide-react"

export default function ManagePlannerDialog({
  open,
  onOpenChange,
  initialData, 
  formData,
  setFormData,
  isSaving,
  onSave,
  onCancel,
  handleItemToggle,
  getAvailableShows,
  getAvailableAttractions,
  getAvailableServices,
  plannerTicket, 
}) {

  const isEditMode = !!initialData?.id;

  const handleSave = () => {
    onSave();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] border-white p-0 overflow-y-auto rounded-3xl">
        <div className="p-6 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3 text-gray-900">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                <Edit className="h-5 w-5 text-teal-700" />
              </div>
  
              <DialogTitle className="text-2xl font-light">
                {isEditMode ? "Edit Planner" : "Create new planner"}
              </DialogTitle>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-6 p-6">

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 mb-3">Planner Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="E.g., My perfect day at the park..."
                className="rounded-2xl h-12 border-2 border-gray-200 focus:border-teal-500 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-3">Description (optional)</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your planner and what you want to do..."
                rows={3}
                className="rounded-2xl border-2 border-gray-200 focus:border-teal-500 transition-all duration-300"
              />
            </div>
          </div>

          {/* Activity Selection - Always shown, but dependent on plannerTicket */}
          {plannerTicket && ( // Only display activity selection if a plannerTicket is provided
            <div>
              <h3 className="text-lg text-gray-900 mb-4">Select Activities</h3>
              <Tabs defaultValue="shows" className="w-full">
                <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-gray-100 p-1">
                  <TabsTrigger
                    value="shows"
                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Shows ({getAvailableShows(plannerTicket).length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="attractions"
                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Attractions ({getAvailableAttractions(plannerTicket).length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="services"
                    className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    <HelpingHand className="w-4 h-4 mr-2" />
                    Services ({getAvailableServices(plannerTicket).length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="shows" className="space-y-4 mt-6">
                  {getAvailableShows(plannerTicket).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No shows available for this date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                      {getAvailableShows(plannerTicket).map((show) => (
                        <div
                          key={show.id}
                          className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-teal-700/30 transition-colors"
                        >
                          <Checkbox
                            checked={formData.showIds.includes(show.id)}
                            onCheckedChange={() => handleItemToggle(show.id, "show")}
                            className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{show.title}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {show.time || "Time to be defined"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="attractions" className="space-y-4 mt-6">
                  {getAvailableAttractions(plannerTicket).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No attractions available for this ticket</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                      {getAvailableAttractions(plannerTicket).map((attraction) => (
                        <div
                          key={attraction.id}
                          className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-teal-700/30 transition-colors"
                        >
                          <Checkbox
                            checked={formData.attractionIds.includes(attraction.id)}
                            onCheckedChange={() => handleItemToggle(attraction.id, "attraction")}
                            className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{attraction.name}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {attraction.location || "Location to be defined"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="services" className="space-y-4 mt-6">
                  {getAvailableServices(plannerTicket).length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <HelpingHand className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No services available for this ticket</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                      {getAvailableServices(plannerTicket).map((service) => (
                        <div
                          key={service.id}
                          className="flex items-center space-x-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-teal-700/30 transition-colors"
                        >
                          <Checkbox
                            checked={formData.serviceIds.includes(service.id)}
                            onCheckedChange={() => handleItemToggle(service.id, "service")}
                            className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{service.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="rounded-full px-12 py-6 border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-300 font-light"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-teal-700 hover:bg-teal-600 text-white rounded-full px-12 py-6 transition-all duration-300 font-light"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? "Save Changes" : "Create Planner"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}