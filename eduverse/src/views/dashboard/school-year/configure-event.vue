<script lang="ts" setup></script>

<template>
	<form class="w-full space-y-4 lg:space-y-6">
		<div class="relative space-y-1 bg-primary text-white p-8 rounded-lg w-full">
			<h5
				class="text-xs uppercase tracking-widest font-bold opacity-90 bg-white/20 w-fit py-2 px-6 rounded-full"
			>
				2026-2027
			</h5>

			<h2 class="mt-4 text-lg lg:text-xl font-semibold">
				Configuration temporelle de l'année
			</h2>
			<p class="text-sm w-[70%]">
				Définissez les jalons académiques et les rythmes d'évaluation pour
				structurer l'année scolaire de manière efficace.
			</p>

			<font-awesome-icon
				icon="triangle-circle-square"
				class="absolute text-8xl opacity-20 lg:opacity-40 top-8 right-8"
			/>
		</div>

		<div class="bg-white p-6 rounded-lg shadow border-l-4 border-primary">
			<div class="flex justify-between items-center gap-4">
				<div class="space-y-2">
					<h3 class="">
						<font-awesome-icon
							icon="calendar-alt"
							class="text-blue-500/60 text-2xl mr-2"
						/>
						<span class="text-primary font-extrabold text-lg"
							>Période d'évaluation trimestrielle</span
						>
					</h3>
					<p class="opacity-60">
						Configurez les bornes temporelles de chaque période pédagogique
					</p>
				</div>
				<button class="bg-primary text-white hover:bg-primary/90">
					<font-awesome-icon icon="plus-circle" class="mr-2" />
					<span class="hidden md:inline">Ajouter un trimestre</span>
				</button>
			</div>

			<div class="mt-8 grid grid-cols-1 gap-4">
				<div
					class="bg-gray-100 border border-gray-300 p-4 rounded-lg grid grid-cols-5 gap-6 items-center"
				>
					<div class="col-span-5 md:col-span-2">
						<label
							class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
						>
							<span>Libellé de période</span>
						</label>
						<input type="text" class="mt-1" placeholder="Nom du trimestre" />
					</div>
					<div class="col-span-5 md:col-span-1">
						<label
							class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
						>
							<span>Date de début</span>
						</label>
						<input type="date" class="mt-1" />
					</div>
					<div class="col-span-5 md:col-span-1">
						<label
							class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
						>
							<span>Date de fin (opt.)</span>
						</label>
						<input type="date" class="mt-1" />
					</div>
					<button
						class="max-md:ml-auto col-span-5 md:col-span-1 mt-4 bg-red-600/20"
						title="Supprimer cette période"
					>
						<font-awesome-icon icon="trash" class="text-red-600/70" />
					</button>
				</div>
			</div>
		</div>

		<div class="bg-white p-6 rounded-lg shadow border-l-4 border-primary">
			<div class="flex justify-between items-center gap-4">
				<div class="space-y-2">
					<h3 class="">
						<font-awesome-icon
							icon="flag"
							class="text-green-600/50 text-2xl mr-2"
						/>
						<span class="text-primary font-extrabold text-lg"
							>Événements clés</span
						>
					</h3>
					<p class="opacity-60">
						Examens, journées pédagogiques, conseils de classe...
					</p>
				</div>
				<button class="bg-gray-200 hover:bg-gray-200/90">
					<font-awesome-icon icon="plus-circle" class="mr-2" />
					<span class="hidden md:inline">Ajouter une période</span>
				</button>
			</div>

			<div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
				<div
					class="bg-gray-100 border border-gray-200 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6"
				>
					<div class="md:col-span-2">
						<label
							class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
						>
							<span>Libellé de l'événement</span>
						</label>
						<input type="text" class="mt-1" placeholder="Nom de l'événement" />
					</div>
					<div class="md:col-span-1">
						<label
							class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
						>
							<span>Date de début</span>
						</label>
						<input type="date" class="mt-1" />
					</div>
					<div class="md:col-span-1">
						<label
							class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
						>
							<span>Date de fin (opt.)</span>
						</label>
						<input type="date" class="mt-1" />
					</div>
					<button
						class="ml-auto md:col-span-2 mt-4 bg-red-600/20"
						title="Supprimer cette période"
					>
						<font-awesome-icon icon="trash" class="text-red-600/70" />
					</button>
				</div>
			</div>
		</div>

		<div class="bg-white p-6 rounded-lg shadow border-l-4 border-primary">
			<div class="flex justify-between items-center gap-4">
				<div class="space-y-2">
					<h3 class="">
						<font-awesome-icon
							icon="flag"
							class="text-amber-600/50 text-2xl mr-2"
						/>
						<span class="text-primary font-extrabold text-lg">Vacances</span>
					</h3>
					<p class="opacity-60">
						Interruptions des cours pour les congés saisonniers
					</p>
				</div>
				<button class="bg-primary text-white hover:bg-primary/90">
					<font-awesome-icon icon="plus-circle" class="mr-2" />
					<span class="hidden md:inline">Ajouter une période</span>
				</button>
			</div>

			<div class="mt-8 grid grid-cols-1 gap-4">
				<div
					class="bg-gray-100 border border-gray-300 p-4 rounded-lg grid grid-cols-5 gap-6 items-center"
				>
					<div class="col-span-5 md:col-span-2">
						<label
							class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
						>
							<span>Libellé de vacances</span>
						</label>
						<input type="text" class="mt-1" placeholder="Nom du trimestre" />
					</div>
					<div class="col-span-5 md:col-span-1">
						<label
							class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
						>
							<span>du</span>
						</label>
						<input type="date" class="mt-1" />
					</div>
					<div class="col-span-5 md:col-span-1">
						<label
							class="text-[0.7rem] font-extrabold uppercase tracking-widest opacity-90"
						>
							<span>au (opt.)</span>
						</label>
						<input type="date" class="mt-1" />
					</div>
					<button
						class="max-md:ml-auto col-span-5 md:col-span-1 mt-4 bg-red-600/20"
						title="Supprimer cette période"
					>
						<font-awesome-icon icon="trash" class="text-red-600/70" />
					</button>
				</div>
			</div>
		</div>

		<div
			class="mt-12 mb-8 flex flex-col md:flex-row md:justify-between gap-8 md:gap-4 md:items-center"
		>
			<div class="-mt-4 col-span-2">
				<font-awesome-icon icon="info-circle" class="mr-2 text-primary" />
				<span class="text-gray-400"
					>Modification possible de ces jalons à tout moment</span
				>
			</div>

			<div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
				<button class="bg-gray-200 w-full md:w-32">Annuler</button>
				<button class="bg-primary text-white w-full md:w-64">
					<font-awesome-icon icon="plus-circle" class="mr-2" />
					<span>Valider la configuraton</span>
				</button>
			</div>
		</div>
	</form>
</template>
