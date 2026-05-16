import React from "react"

const Orders = () => {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8 mx-auto space-y-4">
      <div className="flex md:justify-between md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl  font-bold">
            Orders
          </h1>
          <p className="font-text text-accent-foreground text-sm">
            Monitor and manage all customer transactions.
          </p>
        </div>

        <div className="space-x-2.5">
          <button className="bg-accent border hover:bg-primary transition duration-300  border-primary py-2 px-4 rounded-lg cursor-pointer">
            Export CSV
          </button>
        </div>
      </div>

      <div className="">

      </div>
    </div>
  )
}

export default Orders
