"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { toast } from "react-toastify"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

export default function FormBuilder() {
  const router = useRouter()
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formType, setFormType] = useState("standard")
  const [sections, setSections] = useState([
    {
      id: "section-1",
      title: "Section 1",
      fields: [],
    },
  ])
  const [activeSection, setActiveSection] = useState(0)
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [fieldType, setFieldType] = useState("text")
  const [fieldLabel, setFieldLabel] = useState("")
  const [fieldRequired, setFieldRequired] = useState(false)
  const [fieldOptions, setFieldOptions] = useState([""])
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [published, setPublished] = useState(false)
  const [shareableLink, setShareableLink] = useState("")

  // Field types
  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "textarea", label: "Text Area" },
    { value: "number", label: "Number" },
    { value: "email", label: "Email" },
    { value: "date", label: "Date" },
    { value: "dropdown", label: "Dropdown" },
    { value: "radio", label: "Radio Buttons" },
    { value: "checkbox", label: "Checkboxes" },
    { value: "file", label: "File Upload" },
  ]

  // Add a new section
  const addSection = () => {
    setSections([
      ...sections,
      {
        id: `section-${sections.length + 1}`,
        title: `Section ${sections.length + 1}`,
        fields: [],
      },
    ])
    setActiveSection(sections.length)
  }

  // Update section title
  const updateSectionTitle = (index, title) => {
    const newSections = [...sections]
    newSections[index].title = title
    setSections(newSections)
  }

  // Delete section
  const deleteSection = (index) => {
    if (sections.length === 1) {
      toast.error("You must have at least one section")
      return
    }

    const newSections = [...sections]
    newSections.splice(index, 1)
    setSections(newSections)

    if (activeSection >= index && activeSection > 0) {
      setActiveSection(activeSection - 1)
    }
  }

  // Add field to section
  const addField = () => {
    if (!fieldLabel.trim()) {
      toast.error("Field label is required")
      return
    }

    // For dropdown, radio, and checkbox, ensure there are options
    if (["dropdown", "radio", "checkbox"].includes(fieldType)) {
      const validOptions = fieldOptions.filter((opt) => opt.trim() !== "")
      if (validOptions.length < 2) {
        toast.error("You need at least 2 options")
        return
      }
    }

    const newField = {
      id: `field-${Date.now()}`,
      type: fieldType,
      label: fieldLabel,
      required: fieldRequired,
      options: ["dropdown", "radio", "checkbox"].includes(fieldType)
        ? fieldOptions.filter((opt) => opt.trim() !== "")
        : [],
    }

    const newSections = [...sections]
    newSections[activeSection].fields.push(newField)
    setSections(newSections)

    // Reset field form
    setFieldType("text")
    setFieldLabel("")
    setFieldRequired(false)
    setFieldOptions([""])
    setShowFieldModal(false)

    toast.success("Field added successfully")
  }

  // Delete field
  const deleteField = (sectionIndex, fieldIndex) => {
    const newSections = [...sections]
    newSections[sectionIndex].fields.splice(fieldIndex, 1)
    setSections(newSections)
  }

  // Handle option change
  const handleOptionChange = (index, value) => {
    const newOptions = [...fieldOptions]
    newOptions[index] = value
    setFieldOptions(newOptions)
  }

  // Add option
  const addOption = () => {
    setFieldOptions([...fieldOptions, ""])
  }

  // Remove option
  const removeOption = (index) => {
    if (fieldOptions.length <= 1) {
      toast.error("You need at least one option")
      return
    }

    const newOptions = [...fieldOptions]
    newOptions.splice(index, 1)
    setFieldOptions(newOptions)
  }

  // Handle drag and drop
  const onDragEnd = (result) => {
    const { destination, source, type } = result

    // If dropped outside the list
    if (!destination) {
      return
    }

    // If dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    // If dragging sections
    if (type === "section") {
      const newSections = [...sections]
      const [removed] = newSections.splice(source.index, 1)
      newSections.splice(destination.index, 0, removed)

      setSections(newSections)

      // Update active section if it was moved
      if (activeSection === source.index) {
        setActiveSection(destination.index)
      } else if (activeSection > source.index && activeSection <= destination.index) {
        setActiveSection(activeSection - 1)
      } else if (activeSection < source.index && activeSection >= destination.index) {
        setActiveSection(activeSection + 1)
      }

      return
    }

    // If dragging fields within the same section
    if (source.droppableId === destination.droppableId) {
      const sectionIndex = Number.parseInt(source.droppableId.split("-")[1])
      const newSections = [...sections]
      const fields = [...newSections[sectionIndex].fields]
      const [removed] = fields.splice(source.index, 1)
      fields.splice(destination.index, 0, removed)

      newSections[sectionIndex].fields = fields
      setSections(newSections)
    } else {
      // If dragging fields between sections
      const sourceSectionIndex = Number.parseInt(source.droppableId.split("-")[1])
      const destSectionIndex = Number.parseInt(destination.droppableId.split("-")[1])

      const newSections = [...sections]
      const sourceFields = [...newSections[sourceSectionIndex].fields]
      const destFields = [...newSections[destSectionIndex].fields]

      const [removed] = sourceFields.splice(source.index, 1)
      destFields.splice(destination.index, 0, removed)

      newSections[sourceSectionIndex].fields = sourceFields
      newSections[destSectionIndex].fields = destFields

      setSections(newSections)
    }
  }

  // Save form template
  const saveTemplate = () => {
    if (!formName.trim()) {
      toast.error("Form name is required")
      return
    }

    if (!formDescription.trim()) {
      toast.error("Form description is required")
      return
    }

    // Check if any section is empty
    const emptySections = sections.filter((section) => section.fields.length === 0)
    if (emptySections.length > 0) {
      toast.error("All sections must have at least one field")
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast.success("Form template saved successfully")
      setLoading(false)
    }, 1000)
  }

  // Publish form
  const publishForm = () => {
    if (!formName.trim()) {
      toast.error("Form name is required")
      return
    }

    if (!formDescription.trim()) {
      toast.error("Form description is required")
      return
    }

    // Check if any section is empty
    const emptySections = sections.filter((section) => section.fields.length === 0)
    if (emptySections.length > 0) {
      toast.error("All sections must have at least one field")
      return
    }

    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      const link = `https://example.com/forms/${Date.now()}`
      setShareableLink(link)
      setPublished(true)
      setLoading(false)
      toast.success("Form published successfully")
    }, 1000)
  }

  // Copy shareable link
  const copyLink = () => {
    navigator.clipboard.writeText(shareableLink)
    toast.success("Link copied to clipboard")
  }

  return (
    <DashboardLayout title="Form Builder">
      <div className="space-y-6">
        {/* Form Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Form Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="form-name" className="block text-sm font-medium text-gray-700 mb-1">
                Form Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="form-name"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter form name"
              />
            </div>

            <div>
              <label htmlFor="form-type" className="block text-sm font-medium text-gray-700 mb-1">
                Form Type
              </label>
              <select
                id="form-type"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
              >
                <option value="standard">Standard Form</option>
                <option value="approval">Approval Request</option>
                <option value="survey">Survey</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="form-description" className="block text-sm font-medium text-gray-700 mb-1">
                Form Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="form-description"
                rows={3}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Enter form description"
              />
            </div>
          </div>
        </div>

        {/* Form Builder */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Form Builder</h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {showPreview ? "Edit Form" : "Preview Form"}
              </button>
              <button
                type="button"
                onClick={saveTemplate}
                disabled={loading}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Template"}
              </button>
              <button
                type="button"
                onClick={publishForm}
                disabled={loading || published}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? "Publishing..." : published ? "Published" : "Publish Form"}
              </button>
            </div>
          </div>

          {published && (
            <div className="px-6 py-3 bg-green-50 border-b border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-400 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-green-800">Form published successfully!</span>
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    className="block w-64 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={shareableLink}
                    readOnly
                  />
                  <button
                    type="button"
                    onClick={copyLink}
                    className="ml-2 inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPreview ? (
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{formName}</h2>
              <p className="text-gray-600 mb-6">{formDescription}</p>

              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="mb-8">
                  <h3 className="text-lg font-medium mb-4">{section.title}</h3>

                  {section.fields.map((field, fieldIndex) => (
                    <div key={field.id} className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>

                      {field.type === "text" && (
                        <input
                          type="text"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}

                      {field.type === "textarea" && (
                        <textarea
                          rows={3}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}

                      {field.type === "number" && (
                        <input
                          type="number"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}

                      {field.type === "email" && (
                        <input
                          type="email"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter email address"
                        />
                      )}

                      {field.type === "date" && (
                        <input
                          type="date"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      )}

                      {field.type === "dropdown" && (
                        <select className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                          <option value="">Select an option</option>
                          {field.options.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.type === "radio" && (
                        <div className="mt-2 space-y-2">
                          {field.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center">
                              <input
                                id={`${field.id}-option-${optionIndex}`}
                                name={field.id}
                                type="radio"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <label
                                htmlFor={`${field.id}-option-${optionIndex}`}
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {field.type === "checkbox" && (
                        <div className="mt-2 space-y-2">
                          {field.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center">
                              <input
                                id={`${field.id}-option-${optionIndex}`}
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`${field.id}-option-${optionIndex}`}
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      {field.type === "file" && (
                        <input
                          type="file"
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-4">
                {/* Sections Sidebar */}
                <div className="md:col-span-1 border-r border-gray-200">
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Sections</h3>
                    <Droppable droppableId="sections" type="section">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                          {sections.map((section, index) => (
                            <Draggable key={section.id} draggableId={section.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-3 rounded-md cursor-pointer ${
                                    activeSection === index
                                      ? "bg-blue-50 border border-blue-200"
                                      : "hover:bg-gray-50 border border-gray-200"
                                  }`}
                                  onClick={() => setActiveSection(index)}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{section.title}</span>
                                    <span className="text-xs text-gray-500">{section.fields.length} fields</span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                    <button
                      type="button"
                      onClick={addSection}
                      className="mt-4 w-full inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Section
                    </button>
                  </div>
                </div>

                {/* Section Editor */}
                <div className="md:col-span-3 p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <input
                          type="text"
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium"
                          value={sections[activeSection].title}
                          onChange={(e) => updateSectionTitle(activeSection, e.target.value)}
                        />
                      </div>
                      <div className="ml-4">
                        <button
                          type="button"
                          onClick={() => deleteSection(activeSection)}
                          className="inline-flex items-center p-1 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <Droppable droppableId={`section-${activeSection}`} type="field">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 min-h-[300px]">
                        {sections[activeSection].fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-4 border border-gray-200 rounded-md bg-white shadow-sm hover:shadow"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-blue-50 text-blue-600 mr-3">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M4 6h16M4 12h16M4 18h7"
                                        />
                                      </svg>
                                    </span>
                                    <div>
                                      <span className="block text-sm font-medium text-gray-900">{field.label}</span>
                                      <span className="block text-xs text-gray-500">
                                        {fieldTypes.find((t) => t.value === field.type)?.label}{" "}
                                        {field.required && "(Required)"}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => deleteField(activeSection, index)}
                                      className="inline-flex items-center p-1 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowFieldModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Field
                    </button>
                  </div>
                </div>
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Add Field Modal */}
      {showFieldModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add Field</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="field-type" className="block text-sm font-medium text-gray-700 mb-1">
                      Field Type
                    </label>
                    <select
                      id="field-type"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={fieldType}
                      onChange={(e) => setFieldType(e.target.value)}
                    >
                      {fieldTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="field-label" className="block text-sm font-medium text-gray-700 mb-1">
                      Field Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="field-label"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={fieldLabel}
                      onChange={(e) => setFieldLabel(e.target.value)}
                      placeholder="Enter field label"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="field-required"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={fieldRequired}
                      onChange={(e) => setFieldRequired(e.target.checked)}
                    />
                    <label htmlFor="field-required" className="ml-2 block text-sm text-gray-900">
                      Required field
                    </label>
                  </div>

                  {["dropdown", "radio", "checkbox"].includes(fieldType) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Options <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        {fieldOptions.map((option, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="text"
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`Option ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="ml-2 inline-flex items-center p-1 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addOption}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={addField}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Add Field
                </button>
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
