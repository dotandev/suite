import NetworkSupportChecker from '~~/components/NetworkSupportChecker'
import AgreementList from '~~/dapp/components/agreement/ag-list'
// import AgreementList from '~~/dapp/components/agreement/list'

export default function PatentHome() {
  return (
    <>
      <NetworkSupportChecker />
      <div className="justify-content flex flex-grow flex-col items-center justify-center rounded-md p-3">
        <AgreementList />
      </div>
    </>
  )
}
