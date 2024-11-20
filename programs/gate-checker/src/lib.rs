use anchor_lang::prelude::*;

declare_id!("DjEiZonFEZpw4M33ZCpMWnrshPwEJ5ZNmuV8FWQiVWdg");

#[program]
pub mod gate_checker {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
