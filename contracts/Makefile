.PHONY: deploy-testnet test

deploy-testnet:
	@echo "Deploying TournamentPool to Monad Testnet..."
	forge script script/DeployTournamentPool.s.sol:DeployTournamentPool \
		--rpc-url https://testnet-rpc.monad.xyz \
		--broadcast \
		--legacy

test:
	forge test -vvv
