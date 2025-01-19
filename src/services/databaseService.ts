import { supabase } from '../config/supabase'
import type { User, Bot, Agent, Activation } from '../types/database'

export class DatabaseService {
  // User operations
  static async createOrUpdateUser(walletAddress: string, telegramUsername: string): Promise<User> {
    try {
      // Check if user exists with this wallet address
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingUser) {
        // If user exists, return it without modification
        return existingUser;
      }

      // Create new user record if it doesn't exist
      const { data, error } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          telegram_username: telegramUsername, // Store initial username
          name: null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in createOrUpdateUser:', error);
      throw error;
    }
  }

  // Bot operations
  static async createBot(isAgentariumBot: boolean, customBotToken?: string): Promise<Bot> {
    try {
      const botName = isAgentariumBot ? 'starfishlabs_bot' : 'userbot';
      
      // First, check if the bot already exists
      const { data: existingBot, error: searchError } = await supabase
        .from('bots')
        .select('*')
        .eq('bot_name', botName)
        .single();

      if (searchError && searchError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw searchError;
      }

      // If bot exists, return it
      if (existingBot) {
        return existingBot;
      }

      // If bot doesn't exist, create new one
      const botData: Partial<Bot> = {
        bot_name: botName,
        bot_type: isAgentariumBot ? 'dapp' : 'custom',
        token_id: isAgentariumBot 
          ? '7591957565:AAFQAqWlHfllPA7igtjWb_d0KCIdw4syGfY'
          : customBotToken
      };

      const { data, error } = await supabase
        .from('bots')
        .insert(botData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in createBot:', error);
      throw error;
    }
  }

  // Agent operations
  static async createAgent(
    userId: number,
    botId: number,
    name: string,
    description: string,
    instructions: string
  ): Promise<Agent> {
    try {
      const agentData: Partial<Agent> = {
        user_id: userId,
        bot_id: botId,
        name,
        description,
        instructions: instructions || 'not provided',
        is_active: false
      }

      const { data, error } = await supabase
        .from('agents')
        .insert(agentData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error in createAgent:', error)
      throw error
    }
  }

  // Activation operations
  static async createActivation(
    agentId: number,
    transactionId: string,
    durationHours: number,
    telegramUsername: string
  ): Promise<{ activation: Activation; verificationCode: string }> {
    try {
      // Format telegram username to ensure it starts with @
      const formattedUsername = telegramUsername.startsWith('@') 
        ? telegramUsername 
        : `@${telegramUsername}`;

      console.log('Creating activation with:', { 
        agentId, 
        transactionId, 
        durationHours, 
        telegramUsername: formattedUsername 
      });

      // First call the function to generate verification code with existing parameters
      const { data, error: functionError } = await supabase
        .rpc('create_activation_record', {
          p_agent_id: agentId,
          p_transaction_id: transactionId,
          p_duration_hours: durationHours
        });

      if (functionError) {
        console.error('Function error:', functionError);
        throw functionError;
      }

      if (!data) {
        throw new Error('Failed to create activation record - No data returned');
      }

      // Then update the activation record with the telegram username
      const { data: activations, error: getError } = await supabase
        .from('activations')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (getError) throw getError;
      if (!activations || activations.length === 0) {
        throw new Error('Failed to retrieve activation record');
      }

      // Update the activation with the formatted telegram username
      const { error: updateError } = await supabase
        .from('activations')
        .update({ telegram_authorized_user: formattedUsername })
        .eq('id', activations[0].id);

      if (updateError) throw updateError;

      // Get the updated activation record
      const { data: updatedActivation, error: finalGetError } = await supabase
        .from('activations')
        .select('*')
        .eq('id', activations[0].id)
        .single();

      if (finalGetError) throw finalGetError;
      if (!updatedActivation) throw new Error('Failed to retrieve updated activation record');

      const verificationCode = updatedActivation.verification_code;
      if (!verificationCode) {
        throw new Error('Verification code not found in activation record');
      }

      return {
        activation: updatedActivation,
        verificationCode
      };
    } catch (error) {
      console.error('Error in createActivation:', error);
      throw error;
    }
  }

  // Add a new method to check for existing bot configurations
  static async findOrCreateBot(isAgentariumBot: boolean, customBotToken?: string): Promise<Bot> {
    try {
      if (isAgentariumBot) {
        // For Starfish Labs bot, reuse existing one
        const { data: existingBot, error: searchError } = await supabase
          .from('bots')
          .select('*')
          .eq('bot_type', 'dapp')
          .single();

        if (!searchError && existingBot) {
          return existingBot;
        }
      } else if (customBotToken) {
        // For custom bot, check if this exact token already exists
        const { data: existingBot, error: searchError } = await supabase
          .from('bots')
          .select('*')
          .eq('token_id', customBotToken)
          .single();

        if (!searchError && existingBot) {
          return existingBot;
        }
      }

      // Create new bot if not found
      const timestamp = new Date().getTime();
      const botData: Partial<Bot> = {
        bot_name: isAgentariumBot 
          ? 'starfishlabs_bot' 
          : `userbot_${timestamp}`,
        bot_type: isAgentariumBot ? 'dapp' : 'custom',
        token_id: isAgentariumBot 
          ? '7591957565:AAFQAqWlHfllPA7igtjWb_d0KCIdw4syGfY'
          : customBotToken
      };

      const { data, error } = await supabase
        .from('bots')
        .insert(botData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in findOrCreateBot:', error);
      throw error;
    }
  }

  // Main method to handle the entire agent creation process
  static async handleAgentCreation(
    walletAddress: string,
    telegramUsername: string,
    isAgentariumBot: boolean,
    customBotToken: string | undefined,
    name: string,
    description: string,
    instructions: string,
    transactionId: string,
    durationHours: number
  ) {
    try {
      console.log('Starting agent creation process with:', {
        walletAddress,
        telegramUsername,
        isAgentariumBot,
        transactionId,
        durationHours
      });

      // 1. Get or create user (just stores wallet address)
      const user = await this.createOrUpdateUser(walletAddress, telegramUsername);
      console.log('User found/created:', user);

      // 2. Find or create bot with the specific configuration
      const bot = await this.findOrCreateBot(isAgentariumBot, customBotToken);
      console.log('Bot found/created:', bot);

      // 3. Create agent (this will always be new)
      const agent = await this.createAgent(
        user.id!,
        bot.id!,
        name,
        description,
        instructions
      );
      console.log('Agent created:', agent);

      // 4. Create activation and get verification code (now passing telegram username)
      const { activation, verificationCode } = await this.createActivation(
        agent.id!,
        transactionId,
        durationHours,
        telegramUsername
      );
      console.log('Activation created:', { activation, verificationCode });

      return {
        user,
        bot,
        agent,
        activation,
        verificationCode
      };
    } catch (error) {
      console.error('Error in handleAgentCreation:', error);
      throw error;
    }
  }

  // Add this new method to DatabaseService class
  static async getUserAgents(walletAddress: string) {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, telegram_username')
        .eq('wallet_address', walletAddress)
        .single();

      if (userError) throw userError;
      if (!user) throw new Error('User not found');

      const { data, error } = await supabase
        .from('agents')
        .select(`
          id,
          name,
          description,
          instructions,
          is_active,
          created_at,
          activations (
            activation_status,
            duration_hours,
            created_at,
            verification_code,
            telegram_authorized_user,
            activation_start,
            activation_end,
            telegram_group_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(agent => ({
        ...agent,
        telegram_username: user.telegram_username
      }));
    } catch (error) {
      console.error('Error fetching user agents:', error);
      throw error;
    }
  }

  /**
   * Reactivates an expired agent by updating its activation record.
   * @param activationId - The ID of the activation to update.
   * @param durationHours - The duration for reactivation (e.g., 4, 12, 24).
   */
  static async reactivateAgent(
    activationId: number,
    durationHours: number,
    transactionId: string
  ): Promise<void> {
    try {
      const activationStart = new Date();
      const activationEnd = new Date(activationStart.getTime() + durationHours * 60 * 60 * 1000);

      const { error } = await supabase
        .from('activations')
        .update({
          activation_start: activationStart.toISOString(),
          activation_end: activationEnd.toISOString(),
          activation_status: 'active',
          updated_at: new Date().toISOString(),
          duration_hours: durationHours,
          transaction_id: transactionId
        })
        .eq('id', activationId);

      if (error) throw error;
      console.log(`Activation ${activationId} reactivated for ${durationHours} hours.`);
    } catch (error) {
      console.error('Error in reactivateAgent:', error);
      throw error;
    }
  }
} 