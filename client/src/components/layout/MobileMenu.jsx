import { Dialog, DialogPanel, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import Sidebar from "./Sidebar";

const MobileMenu = ({ open, setOpen }) => {
	return (
		<Transition show={open}>
			<Dialog
				as="div"
				className="relative z-50 lg:hidden"
				onClose={setOpen}
			>
				<Transition
					enter="transition-opacity ease-linear duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="transition-opacity ease-linear duration-300"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-gray-900/80" />
				</Transition>

				<div className="fixed inset-0 flex">
					<Transition
						enter="transition ease-in-out duration-300 transform"
						enterFrom="-translate-x-full"
						enterTo="translate-x-0"
						leave="transition ease-in-out duration-300 transform"
						leaveFrom="translate-x-0"
						leaveTo="-translate-x-full"
					>
						<DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
							<Transition
								enter="ease-in-out duration-300"
								enterFrom="opacity-0"
								enterTo="opacity-100"
								leave="ease-in-out duration-300"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<div className="absolute left-full top-0 flex w-16 justify-center pt-5">
									<button
										type="button"
										className="-m-2.5 p-2.5"
										onClick={() => setOpen(false)}
									>
										<span className="sr-only">
											Close sidebar
										</span>
										<X
											className="h-6 w-6 text-white"
											aria-hidden="true"
										/>
									</button>
								</div>
							</Transition>
							<Sidebar />
						</DialogPanel>
					</Transition>
				</div>
			</Dialog>
		</Transition>
	);
};

export default MobileMenu;
