interface QuestionPackagesFormProps {
  groupId: string;
}

export default function QuestionPackagesForm({ groupId }: QuestionPackagesFormProps) {
    return (
        <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Neues Frage-Paket erstellen</h3>
            <p className="text-sm text-gray-500 mb-4">
                Erstelle ein neues Frage-Paket für deine Gruppe.
            </p>
            {/* Form fields will be added here */}
            <div className="mt-6">
                <p className="text-sm text-gray-500">
                    Gruppen-ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{groupId}</span>
                </p>
            </div>
        </div>
    )
}