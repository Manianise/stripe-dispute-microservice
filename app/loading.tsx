import Spinner from "./components/Spinner"

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Spinner msg="Veuillez patienter..." />
        </div>
    )
  }