
export default function TutorialPage() {

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
            <div className="w-full max-w-4xl bg-white rounded-2xl p-6">
                <h1 className="text-2xl font-bold mb-4">Tutorial</h1>
                <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-6 flex items-center justify-center">
                    <video controls className="w-full h-full object-cover">
                        <source src="ENTER VIDEO PATH" type="video/mp4" />
                    </video>
                </div>

                <div>
                    <p>
                        Instructions
                    </p>

                    <ul className="list-disc">
                        <li>First bullet point item</li>
                        <li>Second bullet point item</li>
                        <li>Third bullet point item</li>
                    </ul>
                </div>
            </div>
        </div>

    )
}