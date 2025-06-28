import NetworkSupportChecker from '~~/components/NetworkSupportChecker'
import PatentForm from '~~/dapp/components/patent/form'

export default function PatentHome() {
  return (
    <>
      <NetworkSupportChecker />
      <div className="justify-content flex flex-grow flex-col items-center justify-center rounded-md p-3">
        <PatentForm />
      </div>
    </>
  )
}
