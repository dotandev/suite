import NetworkSupportChecker from '~~/components/NetworkSupportChecker'
import AgreementForm from '~~/dapp/components/agreement/ag-form'
// import AgreementForm from '~~/dapp/components/agreement/form'

export default function PatentHome() {
  return (
    <>
      <NetworkSupportChecker />
      <div className="justify-content flex flex-grow flex-col items-center justify-center rounded-md p-3">
        {/* <AgreementForm /> */}
        <AgreementForm />
      </div>
    </>
  )
}
