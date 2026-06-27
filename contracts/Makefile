include ../.env
export

.PHONY: deploy test

deploy-testnet:
	@echo "Deploying to Monad Testnet..."
	forge script script/Deploy.s.sol:DeployMonadLeague --rpc-url $(MONAD_RPC_URL) --broadcast --legacy

test:
	forge test -vv
